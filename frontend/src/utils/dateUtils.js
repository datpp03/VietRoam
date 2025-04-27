// Format date to relative time (e.g., "2 hours ago")
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "Vừa xong"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} phút trước`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} giờ trước`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ngày trước`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} tuần trước`
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} tháng trước`
  } else {
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} năm trước`
  }
}

// Format date to standard format (e.g., "15 Jun 2023")
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { day: "numeric", month: "short", year: "numeric" }
  return date.toLocaleDateString("vi-VN", options)
}
