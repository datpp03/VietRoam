import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { FileImage, FileVideo, MapPin, Hash, Globe, Lock, Users, X, Plus, Send, Locate } from "lucide-react";
import classNames from "classnames/bind";
import styles from "./PostUploader.module.scss";
import "leaflet/dist/leaflet.css";

const cx = classNames.bind(styles);

// Custom marker icon - RED
const customIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component xử lý chức năng "Vị trí của tôi"
function LocationMarker({ setPosition, setLocationInfo }) {
  const map = useMap();

  const fetchLocationInfo = async (pos) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`
      );
      const data = await response.json();
      const address = data.display_name;
      const name = data.name || data.address.amenity || data.address.road || "Vị trí của tôi";
      setLocationInfo({
        name,
        address,
        coordinates: [pos[1], pos[0]],
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin vị trí:", err);
    }
  };

  const locateMe = () => {
    map.locate().on("locationfound", (e) => {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      map.flyTo(newPosition, 15);
      fetchLocationInfo(newPosition);
    });
  };

  return (
    <div className={cx("locate-button")} onClick={locateMe}>
      <Locate size={20} />
      <span>Vị trí của tôi</span>
    </div>
  );
}

// Component chọn vị trí trên bản đồ
function LocationPicker({ setPosition, position, setLocationInfo }) {
  const map = useMapEvents({
    click: (e) => {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      fetchLocationInfo(newPosition);
    },
  });

  const fetchLocationInfo = async (pos) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`
      );
      const data = await response.json();
      const address = data.display_name;
      const name = data.name || data.address.amenity || data.address.road || "Vị trí đã chọn";
      setLocationInfo({
        name,
        address,
        coordinates: [pos[1], pos[0]],
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin vị trí:", err);
    }
  };

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

const PostUploader = () => {
  // State cho dữ liệu form
  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [position, setPosition] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [status, setStatus] = useState("published");
  const [visibility, setVisibility] = useState("public");
  const [showMap, setShowMap] = useState(false);
  const [contentError, setContentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const contentRef = useRef(null);

  // Tự động lấy vị trí khi component mount
  useEffect(() => {
    const getDefaultLocation = async () => {
      setIsLoadingLocation(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const newPosition = [pos.coords.latitude, pos.coords.longitude];
              setPosition(newPosition);
              await fetchLocationInfo(newPosition);
              setIsLoadingLocation(false);
            },
            async (err) => {
              console.error("Lỗi khi lấy vị trí:", err);
              const defaultPosition = [21.0278, 105.8342]; // Hà Nội
              setPosition(defaultPosition);
              await fetchLocationInfo(defaultPosition);
              setIsLoadingLocation(false);
            }
          );
        } else {
          console.log("Trình duyệt không hỗ trợ Geolocation");
          const defaultPosition = [21.0278, 105.8342]; // Hà Nội
          setPosition(defaultPosition);
          await fetchLocationInfo(defaultPosition);
          setIsLoadingLocation(false);
        }
      } catch (error) {
        console.error("Lỗi khi lấy vị trí mặc định:", error);
        setIsLoadingLocation(false);
      }
    };

    getDefaultLocation();
  }, []);

  const fetchLocationInfo = async (pos) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`
      );
      const data = await response.json();
      const address = data.display_name;
      const name = data.name || data.address.amenity || data.address.road || "Vị trí hiện tại";
      setLocationInfo({
        name,
        address,
        coordinates: [pos[1], pos[0]],
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin vị trí:", err);
    }
  };

  // Tự động điều chỉnh chiều cao textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Xử lý thay đổi nội dung
  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (value.length < 10) {
      setContentError("Nội dung phải có ít nhất 10 ký tự");
    } else if (value.length > 2000) {
      setContentError("Nội dung không được vượt quá 2000 ký tự");
    } else {
      setContentError("");
    }
  };

  // Xử lý upload ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        setMedia((prev) => [
          ...prev,
          {
            type: "image",
            url: event.target.result,
            file: file,
            description: "",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Xử lý upload video
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("video/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const video = document.createElement("video");
        video.src = event.target.result;
        video.onloadeddata = () => {
          video.currentTime = 1;

          setTimeout(() => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL("image/jpeg");

            setMedia((prev) => [
              ...prev,
              {
                type: "video",
                url: event.target.result,
                file: file,
                thumbnail: thumbnail,
                description: "",
              },
            ]);
          }, 500);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Xóa media
  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý thêm tag
  const handleTagInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tag.length <= 20) {
      setTags((prev) => [...prev, tag]);
      setCurrentTag("");
    }
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  // Hiển thị/ẩn bản đồ
  const toggleMap = () => {
    setShowMap((prev) => !prev);
  };

  // Xóa vị trí
  const clearLocation = () => {
    setPosition(null);
    setLocationInfo(null);
  };

  // Gửi bài viết
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.length < 10 || content.length > 2000) {
      return;
    }

    if (media.length === 0) {
      alert("Vui lòng thêm ít nhất một hình ảnh hoặc video");
      return;
    }

    setIsSubmitting(true);

    const postData = {
      content,
      media: media.map((item) => ({
        type: item.type,
        url: item.url,
        thumbnail: item.thumbnail,
        description: item.description,
      })),
      location: locationInfo,
      tags,
      status,
      visibility,
    };

    console.log("Dữ liệu bài viết:", postData);

    // Giả lập gọi API
    setTimeout(() => {
      alert("Bài viết đã được tạo thành công!");
      // Reset form
      setContent("");
      setMedia([]);
      setPosition(null);
      setLocationInfo(null);
      setTags([]);
      setStatus("published");
      setVisibility("public");
      setShowMap(false);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className={cx("post-uploader")}>
      <div className={cx("post-uploader-container")}>
        <h2 className={cx("title")}>Tạo bài viết mới</h2>

        <form onSubmit={handleSubmit} className={cx("form")}>
          {/* Phần nội dung */}
          <div className={cx("content-section")}>
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Chia sẻ điều gì đó..."
              className={cx("content-input", { error: contentError })}
            />
            {contentError && <p className={cx("error-message")}>{contentError}</p>}
            <div className={cx("content-length")}>{content.length}/2000</div>
          </div>

          {/* Phần media */}
          <div className={cx("media-section")}>
            <div className={cx("media-preview")}>
              {media.map((item, index) => (
                <div key={index} className={cx("media-item")}>
                  {item.type === "image" ? (
                    <img src={item.url || "/placeholder.svg"} alt={`Upload ${index}`} />
                  ) : (
                    <video src={item.url} controls />
                  )}
                  <button type="button" className={cx("remove-media")} onClick={() => removeMedia(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}

              {media.length < 5 && (
                <div className={cx("media-upload-buttons")}>
                  <button type="button" className={cx("upload-button")} onClick={() => fileInputRef.current.click()}>
                    <FileImage size={24} />
                    <span>Ảnh</span>
                  </button>
                  <button type="button" className={cx("upload-button")} onClick={() => videoInputRef.current.click()}>
                    <FileVideo size={24} />
                    <span>Video</span>
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className={cx("hidden-input")}
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              multiple
              className={cx("hidden-input")}
            />
          </div>

          {/* Phần vị trí */}
          <div className={cx("location-section")}>
            <button type="button" className={cx("location-button", { active: locationInfo })} onClick={toggleMap}>
              <MapPin size={20} />
              <span>
                {isLoadingLocation ? "Đang lấy vị trí..." : locationInfo ? locationInfo.name : "Thêm vị trí"}
              </span>
              {locationInfo && (
                <button
                  type="button"
                  className={cx("clear-location")}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLocation();
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </button>

            {showMap && (
              <div className={cx("map-container")}>
                <MapContainer
                  center={position || [21.0278, 105.8342]}
                  zoom={13}
                  className={cx("map")}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker 
                    setPosition={setPosition} 
                    position={position} 
                    setLocationInfo={setLocationInfo} 
                  />
                  <LocationMarker 
                    setPosition={setPosition} 
                    setLocationInfo={setLocationInfo} 
                  />
                </MapContainer>
                {locationInfo && (
                  <div className={cx("location-info")}>
                    <p className={cx("location-name")}>{locationInfo.name}</p>
                    <p className={cx("location-address")}>{locationInfo.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phần tags */}
          <div className={cx("tags-section")}>
            <div className={cx("tags-input-container")}>
              <Hash size={20} />
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Thêm thẻ (nhấn Enter để thêm)"
                className={cx("tags-input")}
              />
              <button type="button" className={cx("add-tag")} onClick={addTag}>
                <Plus size={16} />
              </button>
            </div>

            {tags.length > 0 && (
              <div className={cx("tags-list")}>
                {tags.map((tag, index) => (
                  <div key={index} className={cx("tag")}>
                    #{tag}
                    <button type="button" className={cx("remove-tag")} onClick={() => removeTag(index)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Các tùy chọn */}
          <div className={cx("options-section")}>
            {/* <div className={cx("option")}>
              <label>Trạng thái:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={cx("select")}>
                <option value="published">Đăng ngay</option>
                <option value="draft">Lưu nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div> */}

            <div className={cx("option")}>
              <label>Hiển thị:</label>
              <div className={cx("visibility-options")}>
                <button
                  type="button"
                  className={cx("visibility-option", { active: visibility === "public" })}
                  onClick={() => setVisibility("public")}
                >
                  <Globe size={16} />
                  <span>Công khai</span>
                </button>
                <button
                  type="button"
                  className={cx("visibility-option", { active: visibility === "followers" })}
                  onClick={() => setVisibility("followers")}
                >
                  <Users size={16} />
                  <span>Người theo dõi</span>
                </button>
                <button
                  type="button"
                  className={cx("visibility-option", { active: visibility === "private" })}
                  onClick={() => setVisibility("private")}
                >
                  <Lock size={16} />
                  <span>Chỉ mình tôi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Nút đăng bài */}
          <div className={cx("submit-section")}>
            <button
              type="submit"
              className={cx("submit-button")}
              disabled={isSubmitting || content.length < 10 || media.length === 0}
            >
              {isSubmitting ? "Đang đăng..." : "Đăng bài"}
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostUploader;