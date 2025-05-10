import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import Button from '~/components/Button';
import styles from './EditProfile.module.scss';
import { useAuth } from '~/contexts/AuthContext';
import { updateUser, getCountries, getCities } from '~/services/userService';
import { FileImage, X, AlertCircle } from 'lucide-react';

const cx = classNames.bind(styles);

const travelInterestsOptions = [
  'Adventure',
  'Cultural',
  'Food',
  'Historical',
  'Nature',
  'Beach',
  'Urban Exploration',
];

function EditProfile({ userData, onClose, onUpdate }) {
  const { token, login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: userData.full_name || '',
    profile_picture: userData.profile_picture || '',
    bio: userData.bio || '',
    travel_interests: userData.travel_interests || [],
    location: {
      city: userData.location?.city || '',
      country: userData.location?.country || '',
    },
  });
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryQuery, setCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(userData.profile_picture || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const countryInputRef = useRef(null);
  const cityInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const countryList = await getCountries();
        setCountries(countryList);
      } catch (error) {
        setErrors((prev) => ({ ...prev, countries: 'Không thể tải danh sách quốc gia' }));
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      const selectedCountry = countries.find((c) => c.name === formData.location.country);
      if (selectedCountry) {
        setIsLoadingCities(true);
        try {
          const cityList = await getCities(selectedCountry.code);
          setCities(cityList);
        } catch (error) {
          setErrors((prev) => ({ ...prev, cities: 'Không thể tải danh sách thành phố' }));
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [formData.location.country, countries]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countryInputRef.current && !countryInputRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
      if (cityInputRef.current && !cityInputRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    }
    if (formData.full_name.length > 50) {
      newErrors.full_name = 'Họ và tên không được vượt quá 50 ký tự';
    }
    if (formData.bio.length > 500) {
      newErrors.bio = 'Tiểu sử không được vượt quá 500 ký tự';
    }
    if (!profileImagePreview) {
      newErrors.profile_picture = 'Vui lòng chọn ảnh hồ sơ';
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors((prev) => ({ ...prev, [name]: '', submit: '' }));
  };

  const handleInterestChange = (interest) => {
    setFormData({
      ...formData,
      travel_interests: formData.travel_interests.includes(interest)
        ? formData.travel_interests.filter((i) => i !== interest)
        : [...formData.travel_interests, interest],
    });
  };

  const handleCountrySelect = (country) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        country: country.name,
        city: '',
      },
    });
    setCountryQuery(country.name);
    setShowCountryDropdown(false);
    setErrors((prev) => ({ ...prev, country: '', submit: '' }));
  };

  const handleCitySelect = (city) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        city,
      },
    });
    setCityQuery(city);
    setShowCityDropdown(false);
    setErrors((prev) => ({ ...prev, city: '', submit: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, profile_picture: 'Vui lòng chọn file ảnh' }));
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, profile_picture: '', submit: '' }));
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors((prev) => ({ ...prev, profile_picture: 'Vui lòng chọn ảnh hồ sơ', submit: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('travel_interests', JSON.stringify(formData.travel_interests));
      formDataToSend.append('location', JSON.stringify(formData.location));
      
      if (profileImage) {
        formDataToSend.append('profile_picture', profileImage);
      }

      const response = await updateUser(userData._id, formDataToSend, token);
      if (response.success) {
        login(
          {
            id: response.user._id,
            email: response.user.email,
            name: response.user.full_name,
            avatar: response.user.profile_picture,
            role: response.user.role,
          },
          token,
          JSON.parse(localStorage.getItem('following') || '[]')
        );
        onUpdate(response.user);
        onClose();
      } else {
        setErrors((prev) => ({ ...prev, submit: 'Cập nhật thất bại, vui lòng thử lại' }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: 'Có lỗi xảy ra, vui lòng thử lại' }));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCountries = countryQuery
    ? countries.filter((country) =>
        country.name.toLowerCase().includes(countryQuery.toLowerCase())
      )
    : countries;

  const filteredCities = cityQuery
    ? cities.filter((city) => city.toLowerCase().includes(cityQuery.toLowerCase()))
    : cities;

  const hasCriticalErrors = Object.keys(errors).some(
    (key) => ['full_name', 'bio', 'profile_picture'].includes(key) && errors[key]
  );

  return (
    <div className={cx('modal')}>
      <div className={cx('modal-content')}>
        <h2>Chỉnh sửa hồ sơ</h2>
        {errors.submit && (
          <div className={cx('error-message')}>
            <AlertCircle size={16} />
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className={cx('form-group')}>
            <label>Họ và tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              required
              maxLength={50}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            />
            {errors.full_name && (
              <span id="full_name-error" className={cx('error-message')}>
                <AlertCircle size={16} />
                {errors.full_name}
              </span>
            )}
          </div>
          
          <div className={cx('form-group')}>
            <label>Ảnh hồ sơ</label>
            <div className={cx('image-upload-container')}>
              {profileImagePreview ? (
                <div className={cx('image-preview-container')}>
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className={cx('image-preview')}
                  />
                  <div className={cx('image-actions')}>
                    <button
                      type="button"
                      className={cx('image-action-btn')}
                      onClick={() => fileInputRef.current.click()}
                      title="Thay ảnh"
                      aria-label="Thay ảnh hồ sơ"
                    >
                      <FileImage size={16} />
                    </button>
                    <button
                      type="button"
                      className={cx('image-action-btn', 'remove')}
                      onClick={removeImage}
                      title="Xóa ảnh"
                      aria-label="Xóa ảnh hồ sơ"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={cx('upload-area', { 'drag-over': isDragging })}
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  ref={uploadAreaRef}
                  role="button"
                  tabIndex={0}
                  aria-label="Tải lên hoặc kéo thả ảnh hồ sơ"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <FileImage size={28} />
                  <span>Kéo và thả hoặc nhấp để tải ảnh lên</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className={cx('hidden-input')}
                aria-hidden="true"
              />
              {errors.profile_picture && (
                <span className={cx('error-message')}>
                  <AlertCircle size={16} />
                  {errors.profile_picture}
                </span>
              )}
            </div>
          </div>
          
          <div className={cx('form-group')}>
            <label>Tiểu sử</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Giới thiệu bản thân (tối đa 500 ký tự)"
              maxLength={500}
              aria-describedby={errors.bio ? 'bio-error' : undefined}
            />
            {errors.bio && (
              <span id="bio-error" className={cx('error-message')}>
                <AlertCircle size={16} />
                {errors.bio}
              </span>
            )}
          </div>
          
          <div className={cx('form-group')}>
            <label>Sở thích du lịch</label>
            <div className={cx('interests')}>
              {travelInterestsOptions.map((interest) => (
                <label key={interest} className={cx('interest-option')}>
                  <input
                    type="checkbox"
                    checked={formData.travel_interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    aria-label={`Chọn sở thích ${interest}`}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
          
          <div className={cx('form-group')}>
            <label>Quốc gia</label>
            <div className={cx('dropdown')} ref={countryInputRef}>
              <input
                type="text"
                value={countryQuery}
                onChange={(e) => {
                  setCountryQuery(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                placeholder="Tìm kiếm quốc gia"
                aria-describedby={errors.countries ? 'countries-error' : undefined}
              />
              {showCountryDropdown && (
                <ul className={cx('dropdown-list')}>
                  {isLoadingCountries ? (
                    <li className={cx('dropdown-item', 'dropdown-item-empty')}>
                      Đang tải...
                    </li>
                  ) : filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <li
                        key={country.code}
                        className={cx('dropdown-item')}
                        onClick={() => handleCountrySelect(country)}
                        role="option"
                        aria-selected={formData.location.country === country.name}
                      >
                        {country.name}
                      </li>
                    ))
                  ) : (
                    <li className={cx('dropdown-item', 'dropdown-item-empty')}>
                      Không tìm thấy quốc gia
                    </li>
                  )}
                </ul>
              )}
              {errors.countries && (
                <span id="countries-error" className={cx('error-message')}>
                  <AlertCircle size={16} />
                  {errors.countries}
                </span>
              )}
            </div>
          </div>
          
          <div className={cx('form-group')}>
            <label>Thành phố</label>
            <div className={cx('dropdown')} ref={cityInputRef}>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Tìm kiếm thành phố"
                disabled={!formData.location.country}
                aria-describedby={errors.cities ? 'cities-error' : undefined}
              />
              {showCityDropdown && formData.location.country && (
                <ul className={cx('dropdown-list')}>
                  {isLoadingCities ? (
                    <li className={cx('dropdown-item', 'dropdown-item-empty')}>
                      Đang tải...
                    </li>
                  ) : filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <li
                        key={city}
                        className={cx('dropdown-item')}
                        onClick={() => handleCitySelect(city)}
                        role="option"
                        aria-selected={formData.location.city === city}
                      >
                        {city}
                      </li>
                    ))
                  ) : (
                    <li className={cx('dropdown-item', 'dropdown-item-empty')}>
                      Không tìm thấy thành phố
                    </li>
                  )}
                </ul>
              )}
              {errors.cities && (
                <span id="cities-error" className={cx('error-message')}>
                  <AlertCircle size={16} />
                  {errors.cities}
                </span>
              )}
            </div>
          </div>
          
          <div className={cx('form-actions')}>
            <Button type="button" onClick={onClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button
              primary
              type="submit"
              disabled={isUploading || hasCriticalErrors}
            >
              {isUploading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;