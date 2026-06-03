const placeholderImage = '/images/placeholder.png'
const imageFilePattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i

const isUsableImagePath = (image) => {
  if (!image || !String(image).trim()) {
    return false
  }

  const imagePath = String(image).trim()

  return /^https?:\/\//i.test(imagePath) || imagePath.startsWith('/') || imagePath.includes('/') || imageFilePattern.test(imagePath)
}
const imageExtensionPattern = /\.(avif|gif|jpe?g|png|svg|webp)$/i

const legacyImageCodeMap = {
  BKM: 'products/banh-kho-me-trang-ba-lieu-me-lam-qua-tai-da-nang.jpg',
  BT: 'products/banh-kho-me-trang-ba-lieu-me-lam-qua-tai-da-nang.jpg',
  CB: 'products/bo-mot-nang-500g.jpg',
  CK: 'products/muc-kho-ly-son.jpg',
  MR: 'products/me-xung-deo-hue-200g.jpg',
  MRM: 'products/muc-kho-ly-son.jpg',
  MX: 'products/me-xung-deo-hue-200g.jpg',
  NM: 'products/mam-nem-da-nang-o-dau-3-247x247.jpg',
  QG: 'products/qua-cau-thach-anh-hong.webp',
  TLS: 'products/sa-chanh-5ml-1-600x600.jpg',
  TR: 'products/tra-sen-hue.jpg',
  YS: 'products/tra_linh_chi_hop.jpg',
}

const knownProductImages = [
  { keywords: ['banh', 'kho', 'me'], image: 'products/banh-kho-me-trang-ba-lieu-me-lam-qua-tai-da-nang.jpg' },
  { keywords: ['me', 'xung'], image: 'products/me-xung-deo-hue-200g.jpg' },
  { keywords: ['muc', 'kho', 'ly', 'son'], image: 'products/muc-kho-ly-son.jpg' },
  { keywords: ['muc', 'rim'], image: 'products/muc-kho-ly-son.jpg' },
  { keywords: ['hang', 'thach', 'anh', 'tim'], image: 'products/hang-da-thach-anh-tim-3-5kg.jpg' },
  { keywords: ['qua', 'cau', 'thach', 'anh', 'hong'], image: 'products/qua-cau-thach-anh-hong.webp' },
  { keywords: ['tra', 'sam', 'dua'], image: 'products/Tra-sam-dua-da-nang-chinh-goc-tra-tien.jpg' },
  { keywords: ['tra', 'sen'], image: 'products/tra-sen-hue.jpg' },
  { keywords: ['tra', 'linh', 'chi'], image: 'products/tra_linh_chi_hop.jpg' },
  { keywords: ['bo', 'mot', 'nang'], image: 'products/bo-mot-nang-500g.jpg' },
  { keywords: ['mam', 'nem'], image: 'products/mam-nem-da-nang-o-dau-3-247x247.jpg' },
  { keywords: ['mam', 'di', 'can'], image: 'products/mam-di-can-da-nang-3.jpg' },
  { keywords: ['cao', 'che', 'vang'], image: 'products/Cao-che-vang.jpg' },
  { keywords: ['que', 'tra', 'my'], image: 'products/que-tra-my-cat-khuc_grande.jpg' },
  { keywords: ['tinh', 'dau', 'tram'], image: 'products/tinh-dau-tram-hue-10ml.jpg' },
  { keywords: ['tinh', 'dau', 'sa', 'chanh'], image: 'products/tinh-dau-nguyen-chat-sa-chanh-10ml.jpg' },
  { keywords: ['bot', 'que'], image: 'products/bot-que-tra-my-2678.jpg' },
  { keywords: ['lua', 'ma', 'chau'], image: 'products/lua_ma_chau.jpg' },
  { keywords: ['gom', 'thanh', 'ha'], image: 'products/gom-thanh-ha.webp' },
  { keywords: ['tho', 'cam'], image: 'products/tho-cam-27.jpg' },
  { keywords: ['phong', 'thuy'], image: 'products/da_phong_thuy.jpg' },
]

const normalizeSearchText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

const findKnownProductImage = (value) => {
  const normalizedValue = normalizeSearchText(value)

  return knownProductImages.find((item) => item.keywords.every((keyword) => normalizedValue.includes(keyword)))?.image || ''
}

export const isImageValue = (image) => {
  if (!image || !String(image).trim()) {
    return false
  }

  const imagePath = String(image).trim()

  return /^https?:\/\//i.test(imagePath) || imagePath.startsWith('/') || imagePath.includes('/') || imageExtensionPattern.test(imagePath)
}

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

export const resolveProductImage = (productName, image) => {
  const imagePath = String(image || '').trim()
  const legacyImage = legacyImageCodeMap[imagePath.toUpperCase()]

  return findKnownProductImage(productName) || legacyImage || imagePath
}

export const handleImageError = (event) => {
  event.currentTarget.src = placeholderImage
}

export const getBlogImageSource = (blog = {}) => {
  if (blog.hinhAnh) {
    return blog.hinhAnh
  }

  if (isUsableImagePath(blog.image)) {
    return blog.image
  }

  if (isUsableImagePath(blog.thumbnail)) {
    return blog.thumbnail
  }

  const key = String(`${blog.slug || ''} ${blog.id || ''} ${blog.topic || ''} ${blog.province || ''}`).toLowerCase()

  if (key.includes('tra') || key.includes('trà')) {
    return 'blogs/tra-sam-dua-da-nang_blog.webp'
  }

  if (key.includes('que') || key.includes('quế')) {
    return 'blogs/que_tra_my_blog.jpg'
  }

  if (key.includes('hoi-an') || key.includes('hội an')) {
    return 'blogs/Hoi_an.jpg'
  }

  if (key.includes('da-nang') || key.includes('đà nẵng')) {
    return 'blogs/bien_da_nang.jpg'
  }

  if (key.includes('tay-nguyen') || key.includes('tây nguyên')) {
    return 'blogs/Tay_nguyen.jpg'
  }

  if (key.includes('hue') || key.includes('huế')) {
    return 'blogs/co_do_hue.jpg'
  }

  return 'blogs/Tra_hue.jpg'
}

export { placeholderImage }
