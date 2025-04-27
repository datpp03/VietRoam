"use client"

import { useState, useRef, useEffect } from "react"
import { X, Camera, Trash2 } from "lucide-react"
import styles from "./EditProfileModal.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

// Danh sách các sở thích du lịch từ schema
const TRAVEL_INTERESTS = ["Adventure", "Cultural", "Food", "Historical", "Nature", "Beach", "Urban Exploration"]

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    location: {
      city: user.location?.city || "",
      country: user.location?.country || "",
    },
    travel_interests: user.travel_interests || [],
  })

  const [profilePicture, setProfilePicture] = useState(user.profile_picture || "")
  const [previewImage, setPreviewImage] = useState(null)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })

      // Validate full_name
      if (name === "full_name") {
        if (!value.trim()) {
          setErrors({ ...errors, full_name: "Tên không được để trống" })
        } else if (value.length > 50) {
          setErrors({ ...errors, full_name: "Tên không được vượt quá 50 ký tự" })
        } else {
          const newErrors = { ...errors }
          delete newErrors.full_name
          setErrors(newErrors)
        }
      }

      // Validate bio
      if (name === "bio" && value.length > 500) {
        setErrors({ ...errors, bio: "Tiểu sử không được vượt quá 500 ký tự" })
      } else if (name === "bio") {
        const newErrors = { ...errors }
        delete newErrors.bio
        setErrors(newErrors)
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you would upload the file to a server
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)

        // Clear any previous errors
        const newErrors = { ...errors }
        delete newErrors.profile_picture
        setErrors(newErrors)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setProfilePicture("/images/default-avatar.jpg") // Set to default avatar
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleInterestToggle = (interest) => {
    if (formData.travel_interests.includes(interest)) {
      setFormData({
        ...formData,
        travel_interests: formData.travel_interests.filter((item) => item !== interest),
      })
    } else {
      setFormData({
        ...formData,
        travel_interests: [...formData.travel_interests, interest],
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate full_name
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Tên không được để trống"
    } else if (formData.full_name.length > 50) {
      newErrors.full_name = "Tên không được vượt quá 50 ký tự"
    }

    // Validate bio
    if (formData.bio.length > 500) {
      newErrors.bio = "Tiểu sử không được vượt quá 500 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Prepare data for saving
    const updatedProfile = {
      ...formData,
      profile_picture: previewImage || profilePicture,
    }

    onSave(updatedProfile)
  }

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal-container")} ref={modalRef}>
        <div className={cx("modal-header")}>
          <h2>Chỉnh sửa hồ sơ</h2>
          <button className={cx("close-button")} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={cx("edit-form")} onSubmit={handleSubmit}>
          <div className={cx("profile-picture-section")}>
            <div className={cx("profile-picture-container")}>
              <img
                src={previewImage || profilePicture || "/images/default-avatar.jpg"}
                alt="Profile"
                className={cx("profile-picture")}
              />
              <div className={cx("picture-actions")}>
                <button type="button" className={cx("upload-button")} onClick={() => fileInputRef.current.click()}>
                  <Camera size={18} />
                </button>
                {(previewImage || (profilePicture && profilePicture !== "/images/default-avatar.jpg")) && (
                  <button type="button" className={cx("remove-button")} onClick={handleRemoveImage}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className={cx("file-input")}
            />
            <p className={cx("picture-help")}>Nhấp vào biểu tượng máy ảnh để tải lên ảnh mới</p>
            {errors.profile_picture && <p className={cx("error-message")}>{errors.profile_picture}</p>}
          </div>

          <div className={cx("form-group")}>
            <label htmlFor="full_name">
              Tên đầy đủ <span className={cx("required")}>*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={cx("form-input", { error: errors.full_name })}
              required
              maxLength={50}
            />
            {errors.full_name && <p className={cx("error-message")}>{errors.full_name}</p>}
          </div>

          <div className={cx("form-group")}>
            <label htmlFor="bio">
              Tiểu sử{" "}
              <span className={cx("char-count", { error: formData.bio.length > 500 })}>{formData.bio.length}/500</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={cx("form-textarea", { error: errors.bio })}
              rows={3}
              maxLength={500}
            />
            {errors.bio && <p className={cx("error-message")}>{errors.bio}</p>}
          </div>

          <div className={cx("form-row")}>
            <div className={cx("form-group")}>
              <label htmlFor="location.city">Thành phố</label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                className={cx("form-input")}
              />
            </div>

            <div className={cx("form-group")}>
              <label htmlFor="location.country">Quốc gia</label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                className={cx("form-input")}
              />
            </div>
          </div>

          <div className={cx("form-group")}>
            <label>Sở thích du lịch</label>
            <div className={cx("interests-container")}>
              {TRAVEL_INTERESTS.map((interest) => (
                <div
                  key={interest}
                  className={cx("interest-tag", { active: formData.travel_interests.includes(interest) })}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </div>
              ))}
            </div>
          </div>

          <div className={cx("form-actions")}>
            <button type="button" className={cx("cancel-button")} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={cx("save-button")}>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
