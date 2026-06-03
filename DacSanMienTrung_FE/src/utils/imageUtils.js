const placeholderImage = '/images/placeholder.png'

export const getImageUrl = (image) => {
  if (!image || !String(image).trim()) {
    return placeholderImage
  }

  const imagePath = String(image).trim()

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('/')) {
    return imagePath
  }

  return `/images/${imagePath}`
}

export const handleImageError = (event) => {
  event.currentTarget.src = placeholderImage
}

export { placeholderImage }
