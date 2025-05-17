/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './PostLocationStats.module.scss';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { getLocationStats } from '~/services/postService';
import { getCountries, getCities } from '~/services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaFilter, FaSyncAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import debounce from 'lodash/debounce';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red map pin icon
const customIcon = (postCount) => {
  const size = Math.min(32 + postCount / 8, 48); // Dynamic size based on post count
  return L.divIcon({
    className: styles['custom-marker'],
    html: `
      <div class="marker-container" style="width: ${size}px; height: ${size * 1.5}px;">
        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" class="marker-icon" style="width: ${size}px; height: ${size * 1.5}px;" />
        <div class="post-count" style="top: ${size * 0.2}px;">${postCount}</div>
        <div class="pulse"></div>
      </div>
    `,
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5], // Anchor at bottom center of pin
    popupAnchor: [0, -size * 1.5], // Popup above pin
  });
};

const cx = classNames.bind(styles);

function MapController({ stats }) {
  const map = useMap();

  useEffect(() => {
    if (stats.length > 0) {
      const validStats = stats.filter(stat => stat.coordinates?.length === 2);
      if (validStats.length > 0) {
        const bounds = L.latLngBounds(
          validStats.map(stat => [stat.coordinates[1], stat.coordinates[0]])
        );
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 12,
          animate: true 
        });
      } else {
        map.setView([0, 0], 2, { animate: true });
      }
    }
  }, [stats, map]);

  return null;
}

function PostLocationStats() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    minPosts: '',
    country: '',
    city: '',
  });
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countryList = await getCountries();
        setCountries(countryList);
      } catch (error) {
        toast.error('Failed to load countries');
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (filters.country) {
      const fetchCities = async () => {
        try {
          const cityList = await getCities(filters.country);
          setCities(cityList);
          setFilters(prev => ({ ...prev, city: '' }));
        } catch (error) {
          toast.error('Failed to load cities');
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setFilters(prev => ({ ...prev, city: '' }));
    }
  }, [filters.country]);

  // Debounced fetch stats
  const fetchStats = useCallback(
    debounce(async (currentFilters) => {
      try {
        setIsLoading(true);
        const response = await getLocationStats(currentFilters);
        if (response.success) {
          setStats(response.stats || []);
          if (!response.stats?.length) {
            toast.info('No posts found for the selected filters');
          }
        } else {
          toast.error(response.message || 'Failed to load location stats');
        }
      } catch (error) {
        toast.error('Error loading location stats');
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchStats(filters);
  }, [filters, fetchStats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      minPosts: '',
      country: '',
      city: '',
    });
  };

  const markers = useMemo(() => {
    return stats
      .filter(stat => stat.coordinates?.length === 2)
      .map((stat, index) => (
        <Marker
          key={`${stat.name}-${index}`}
          position={[stat.coordinates[1], stat.coordinates[0]]}
          icon={customIcon(stat.postCount)}
        >
          <Popup>
            <div className={cx('popup-content')}>
              <h3>{stat.name}</h3>
              <p>Posts: {stat.postCount}</p>
              <p>Coordinates: [{stat.coordinates[0].toFixed(4)}, {stat.coordinates[1].toFixed(4)}]</p>
            </div>
          </Popup>
        </Marker>
      ));
  }, [stats]);

  return (
    <div className={cx('post-location-stats')}>
      <header className={cx('header')}>
        <h1><FaMapMarkerAlt /> Post Location Analytics</h1>
      </header>

      <div className={cx('filter-section')}>
        <h3><FaFilter /> Filters</h3>
        <div className={cx('filter-grid')}>
          <div className={cx('filter-group')}>
            <label>Minimum Posts</label>
            <input
              type="number"
              name="minPosts"
              value={filters.minPosts}
              onChange={handleFilterChange}
              placeholder="Enter minimum posts"
              min="0"
            />
          </div>
          <div className={cx('filter-group')}>
            <label>Country</label>
            <select name="country" value={filters.country} onChange={handleFilterChange}>
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className={cx('filter-group')}>
            <label>City</label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              disabled={!filters.country}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button className={cx('reset-button')} onClick={resetFilters}>
            <FaSyncAlt /> Reset Filters
          </button>
        </div>
      </div>

      <div className={cx('map-container')}>
        {isLoading ? (
          <div className={cx('loading')}>
            <ClipLoader color="#0052cc" size={60} />
            <span>Loading map...</span>
          </div>
        ) : (
          <MapContainer
            center={[0, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            className={cx('map')}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ZoomControl position="bottomright" />
            <MapController stats={stats} />
            {markers}
          </MapContainer>
        )}
      </div>

      <div className={cx('table-container')}>
        {isLoading ? (
          <div className={cx('loading')}>
            <ClipLoader color="#0052cc" size={60} />
            <span>Loading data...</span>
          </div>
        ) : stats.length === 0 ? (
          <div className={cx('no-results')}>
            <FaMapMarkerAlt /> No locations found
          </div>
        ) : (
          <table className={cx('stats-table')}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Posts</th>
                <th>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={`${stat.name}-${index}`} className={cx({ 'highlight-row': stat.postCount > 50 })}>
                  <td>{stat.name || 'Unknown'}</td>
                  <td>{stat.postCount}</td>
                  <td>
                    {stat.coordinates
                      ? `[${stat.coordinates[0].toFixed(4)}, ${stat.coordinates[1].toFixed(4)}]`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default PostLocationStats;