import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockPurchasedCombos } from '../../data/mockCombos'
import { mockOrders } from '../../data/mockOrders'
import { mockCurrentUser } from '../../data/mockUsers'
import { getUserById } from '../../services/authService'
import { addToCart, clearCart } from '../../services/cartService'
import {
  comboStatusLabels,
  getComboById,
  getCombosByUser,
  mapComboFromApi,
  setPendingCombo,
} from '../../services/comboService'
import {
  cancelOrder as cancelOrderApi,
  confirmReceived,
  confirmWalletPayment,
  getOrdersByUser,
  orderStatusLabels,
  orderStatusOptions,
  normalizeOrderStatus,
  paymentMethodLabels,
  paymentStatusLabels,
} from '../../services/orderService'
import { getReviewsByUser, mapReviewFromApi } from '../../services/reviewService'
import { updateUser as updateUserProfile } from '../../services/userService'
import { getCurrentUser, getCurrentUserId, logout, normalizeUser } from '../../utils/authStorage'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'
import './ProfilePage.css'

const accountTabs = [
  { id: 'info', label: 'ThÃ´ng tin cÃ¡ nhÃ¢n' },
  { id: 'orders', label: 'ÄÆ¡n hÃ ng' },
  { id: 'addresses', label: 'Äá»‹a chá»‰' },
  { id: 'points', label: 'Äiá»ƒm tÃ­ch lÅ©y' },
  { id: 'reviews', label: 'ÄÃ¡nh giÃ¡' },
  { id: 'combos', label: 'Combo quÃ  táº·ng' },
]

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}Ä‘`
const normalizeMockUser = (user) => ({
  ...user,
  name: user.name || user.hoTen || '',
  phone: user.phone || user.soDienThoai || '',
  diaChi: user.diaChi || user.address || '',
  address: user.diaChi || user.address || '',
  role: user.role || user.vaiTro || 'khachhang',
  loyaltyPoints: Number(user.loyaltyPoints || user.diemTichLuy || 0),
  customerType: user.customerType || user.phanLoaiKhachHang || 'ThÃ¢n thiáº¿t',
  createdAt: user.createdAt || user.ngayDangKy || '',
})
const normalizeMockOrder = (order) => ({
  ...order,
  status: normalizeOrderStatus(order.status),
  paymentStatus: order.paymentStatus || '',
  paymentMethod: order.paymentMethod || 'COD',
  total: order.total ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee - order.discount,
})
const fallbackOrders = mockOrders.map(normalizeMockOrder)
const fallbackCombos = mockPurchasedCombos.map((combo) =>
  mapComboFromApi({
    maCombo: combo.id,
    tenCombo: combo.name,
    loaiCombo: combo.type || '',
    dipLe: combo.occasion,
    loiNhan: combo.message,
    trangThaiCombo:
      combo.status === 'ÄÃ£ mua' || combo.status === 'Ã„ÂÃƒÂ£ mua'
        ? 'daDatHang'
        : combo.status === 'ÄÃ£ há»§y'
          ? 'daHuy'
          : 'luuTam',
    tongTien: combo.total,
    ngayTao: combo.createdAt || '',
    items: (combo.products || []).map((product, index) => ({
      maChiTietCombo: `${combo.id}-${index}`,
      tenSanPham: product,
      soLuong: 1,
      donGia: 0,
    })),
  }),
)
const fallbackReviews = mockOrders.flatMap((order) =>
  (order.items || [])
    .filter((item) => item.reviewContent || item.noiDungDanhGia)
    .map((item) =>
      mapReviewFromApi({
        maChiTietDonHang: item.maChiTietDonHang ?? item.id,
        maDonHang: order.id,
        maNguoiDung: mockCurrentUser.id,
        hoTenNguoiDung: mockCurrentUser.name,
        tenSanPham: item.name,
        hinhAnhSanPham: item.image,
        tenBienThe: item.variant,
        soSao: item.rating || 5,
        noiDungDanhGia: item.reviewContent || item.noiDungDanhGia,
        ngayDanhGia: item.reviewDate || item.ngayDanhGia || order.orderDate,
        daKiemDuyetDanhGia: item.daKiemDuyetDanhGia ?? item.reviewApproved ?? false,
      }),
    ),
)

const formatDate = (value) => {
  if (!value) return 'Äang cáº­p nháº­t'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const renderStars = (rating) => 'â˜…'.repeat(Math.max(0, Math.min(5, Number(rating || 0))))

const ReviewImage = ({ value, label }) => (
  <img src={getImageUrl(value)} alt={label || 'SÃ¡ÂºÂ£n phÃ¡ÂºÂ©m'} onError={handleImageError} />
)

function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')
  const [orderFilter, setOrderFilter] = useState('all')
  const [orders, setOrders] = useState(fallbackOrders)
  const [profileUser, setProfileUser] = useState(normalizeMockUser(getCurrentUser() || mockCurrentUser))
  const [hasUserApiError, setHasUserApiError] = useState(false)
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [hasOrdersApiError, setHasOrdersApiError] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [reviews, setReviews] = useState(fallbackReviews)
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [hasReviewsApiError, setHasReviewsApiError] = useState(false)
  const [reviewsError, setReviewsError] = useState('')
  const [combos, setCombos] = useState(fallbackCombos)
  const [isCombosLoading, setIsCombosLoading] = useState(false)
  const [hasCombosApiError, setHasCombosApiError] = useState(false)
  const [combosError, setCombosError] = useState('')
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedCombo, setSelectedCombo] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: profileUser.name || '',
    email: profileUser.email || '',
    phone: profileUser.phone || '',
    birthday: profileUser.birthday || '',
    diaChi: profileUser.diaChi || profileUser.address || '',
  })
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  const loadOrders = useCallback(async (status = orderFilter) => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate('/login?redirect=/profile')
      return
    }

    setIsOrdersLoading(true)
    setOrdersError('')

    try {
      const apiOrders = await getOrdersByUser(maNguoiDung, status === 'all' ? undefined : status)
      setOrders(apiOrders)
      setHasOrdersApiError(false)
    } catch {
      setOrders(fallbackOrders)
      setHasOrdersApiError(true)
    } finally {
      setIsOrdersLoading(false)
    }
  }, [navigate, orderFilter])

  useEffect(() => {
    const loadTimer = window.setTimeout(async () => {
      try {
        const maNguoiDung = getCurrentUserId()

        if (!maNguoiDung) {
          navigate('/login?redirect=/profile')
          return
        }

        const apiUser = await getUserById(maNguoiDung)
        setProfileUser(normalizeUser(apiUser))
        setHasUserApiError(false)
      } catch {
        setProfileUser(normalizeMockUser(getCurrentUser() || mockCurrentUser))
        setHasUserApiError(true)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [navigate])

  useEffect(() => {
    setProfileForm({
      name: profileUser.name || '',
      email: profileUser.email || '',
      phone: profileUser.phone || '',
      birthday: profileUser.birthday || '',
      diaChi: profileUser.diaChi || profileUser.address || '',
    })
  }, [profileUser])

  useEffect(() => {
    if (activeTab !== 'orders') {
      return undefined
    }

    const loadTimer = window.setTimeout(() => {
      loadOrders()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [activeTab, loadOrders])

  useEffect(() => {
    if (activeTab !== 'reviews') {
      return undefined
    }

    const loadTimer = window.setTimeout(async () => {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate('/login?redirect=/profile')
        return
      }

      setIsReviewsLoading(true)
      setReviewsError('')

      try {
        const apiReviews = await getReviewsByUser(maNguoiDung)
        setReviews(apiReviews)
        setHasReviewsApiError(false)
      } catch (error) {
        setReviews(fallbackReviews)
        setHasReviewsApiError(true)
        setReviewsError(error?.message || '')
      } finally {
        setIsReviewsLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [activeTab, navigate])

  useEffect(() => {
    if (activeTab !== 'combos') {
      return undefined
    }

    const loadTimer = window.setTimeout(async () => {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate('/login?redirect=/profile')
        return
      }

      setIsCombosLoading(true)
      setCombosError('')

      try {
        const apiCombos = await getCombosByUser(maNguoiDung)
        setCombos(apiCombos)
        setHasCombosApiError(false)
      } catch (error) {
        setCombos(fallbackCombos)
        setHasCombosApiError(true)
        setCombosError(error?.message || '')
      } finally {
        setIsCombosLoading(false)
      }
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [activeTab, navigate])

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') {
      return orders
    }
    return orders.filter((order) => order.status === orderFilter)
  }, [orderFilter, orders])

  const changeOrderFilter = (status) => {
    setOrderFilter(status)

    if (!hasOrdersApiError) {
      loadOrders(status)
    }
  }

  const submitCancelOrder = async (event) => {
    event.preventDefault()

    if (!cancelTargetOrder) {
      return
    }

    if (!cancelReason.trim()) {
      setOrdersError('Vui lÃ²ng nháº­p lÃ½ do há»§y Ä‘Æ¡n.')
      return
    }

    try {
      await cancelOrderApi(cancelTargetOrder.id, { lyDoHuy: cancelReason.trim() })
      setCancelTargetOrder(null)
      setCancelReason('')
      await loadOrders()
    } catch (error) {
      setOrdersError(error?.message || 'KhÃ´ng thá»ƒ há»§y Ä‘Æ¡n hÃ ng.')
    }
  }

  const handleConfirmReceived = async (order) => {
    if (!window.confirm('XÃ¡c nháº­n báº¡n Ä‘Ã£ nháº­n Ä‘Æ°á»£c hÃ ng?')) {
      return
    }

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate('/login?redirect=/profile')
        return
      }

      setOrdersError('')
      await confirmReceived(order.id, { maNguoiDung })
      await loadOrders()
    } catch (error) {
      setOrdersError(error?.message || 'KhÃ´ng thá»ƒ xÃ¡c nháº­n nháº­n hÃ ng.')
    }
  }

  const handleConfirmWalletPayment = async (order) => {
    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate('/login?redirect=/profile')
        return
      }

      setOrdersError('')
      await confirmWalletPayment(order.id, {
        maNguoiDung,
        maGiaoDich: `VI-DEMO-DH${order.id}`,
      })
      await loadOrders()
    } catch (error) {
      setOrdersError(error?.message || 'KhÃ´ng thá»ƒ xÃ¡c nháº­n thanh toÃ¡n vÃ­.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }))
    setProfileMessage('')
    setProfileError('')
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate('/login?redirect=/profile')
      return
    }

    setIsProfileSaving(true)
    setProfileMessage('')
    setProfileError('')

    try {
      const updatedUser = await updateUserProfile(maNguoiDung, {
        hoTen: profileForm.name.trim(),
        email: profileForm.email.trim(),
        soDienThoai: profileForm.phone.trim(),
        ngaySinh: profileForm.birthday || null,
        diaChi: profileForm.diaChi.trim(),
      })
      const normalizedUpdatedUser = normalizeUser(updatedUser)
      setProfileUser(normalizedUpdatedUser)
      localStorage.setItem('dacsan_user', JSON.stringify(normalizedUpdatedUser))
      window.dispatchEvent(new Event('auth-changed'))
      setProfileMessage('Ã„ÂÃƒÂ£ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ´ng tin cÃ¡ÂºÂ¡ nhÃƒÂ¢n.')
    } catch (error) {
      setProfileError(error?.message || 'KhÃƒÂ´ng thÃ¡Â»Æ’ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n.')
    } finally {
      setIsProfileSaving(false)
    }
  }

  const loadComboDetail = async (combo) => {
    setSelectedCombo(combo)

    try {
      setSelectedCombo(await getComboById(combo.id))
    } catch (error) {
      setCombosError(error?.message || 'KhÃ´ng thá»ƒ táº£i chi tiáº¿t combo.')
    }
  }

  const orderComboNow = async (combo) => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate('/login?redirect=/profile')
      return
    }

    setIsCombosLoading(true)
    setCombosError('')

    try {
      const detailCombo = combo.items?.length > 0 ? combo : await getComboById(combo.id)
      const comboItems = detailCombo.items || []

      if (comboItems.length === 0) {
        setCombosError('Combo chÆ°a cÃ³ sáº£n pháº©m.')
        return
      }

      if (!window.confirm('Báº¡n muá»‘n Ä‘Æ°a combo nÃ y vÃ o giá» hÃ ng vÃ  chuyá»ƒn sang thanh toÃ¡n?')) {
        return
      }

      try {
        await clearCart(maNguoiDung)
      } catch {
        setCombosError('Há»‡ thá»‘ng Ä‘ang báº­n, vui lÃ²ng thá»­ láº¡i.')
        return
      }

      for (const item of comboItems) {
        await addToCart({
          maNguoiDung,
          maBienThe: item.maBienThe || item.variantId,
          soLuong: item.soLuong || item.quantity,
        })
      }
      setPendingCombo(detailCombo)
      navigate('/checkout')
    } catch (error) {
      setCombosError(error?.message || 'KhÃ´ng thá»ƒ Ä‘Æ°a combo vÃ o giá» hÃ ng.')
    } finally {
      setIsCombosLoading(false)
    }
  }

  const renderInfo = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>TÃ i khoáº£n</span>
        <h2>ThÃ´ng tin cÃ¡ nhÃ¢n</h2>
      </div>

      <div className="profile-info-grid">
        <div>
          <span>Há» vÃ  tÃªn</span>
          <strong>{profileUser.name || 'KhÃ¡ch hÃ ng demo'}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{profileUser.email || 'Äang cáº­p nháº­t'}</strong>
        </div>
        <div>
          <span>Sá»‘ Ä‘iá»‡n thoáº¡i</span>
          <strong>{profileUser.phone || 'Äang cáº­p nháº­t'}</strong>
        </div>
        <div>
          <span>NgÃ y sinh</span>
          <strong>{profileUser.birthday || 'Äang cáº­p nháº­t'}</strong>
        </div>
        <div>
          <span>Vai trÃ²</span>
          <strong>{profileUser.role || 'khachhang'}</strong>
        </div>
        <div>
          <span>Äiá»ƒm tÃ­ch lÅ©y</span>
          <strong>{Number(profileUser.loyaltyPoints || 0).toLocaleString('vi-VN')} Ä‘iá»ƒm</strong>
        </div>
        <div>
          <span>PhÃ¢n loáº¡i khÃ¡ch hÃ ng</span>
          <strong>{profileUser.customerType || 'Äang cáº­p nháº­t'}</strong>
        </div>
        <div>
          <span>NgÃ y Ä‘Äƒng kÃ½</span>
          <strong>{profileUser.createdAt || 'Äang cáº­p nháº­t'}</strong>
        </div>
      </div>
      {hasUserApiError ? (
        <p className="product-result-summary">
          KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c backend, Ä‘ang dÃ¹ng thÃ´ng tin tÃ i khoáº£n lÆ°u cá»¥c bá»™ hoáº·c dá»¯ liá»‡u máº«u.
        </p>
      ) : null}
    </section>
  )

  const renderOrders = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <div>
          <span>Lá»‹ch sá»­ mua hÃ ng</span>
          <h2>ÄÆ¡n hÃ ng cá»§a tÃ´i</h2>
        </div>
      </div>

      <div className="order-filter-tabs">
        {orderStatusOptions.map((option) => (
          <button
            className={orderFilter === option.value ? 'active' : ''}
            key={option.value}
            type="button"
            onClick={() => changeOrderFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isOrdersLoading ? <p className="product-result-summary">Äang táº£i Ä‘Æ¡n hÃ ng...</p> : null}
      {hasOrdersApiError ? (
        <p className="product-result-summary">
          KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c backend, Ä‘ang dÃ¹ng dá»¯ liá»‡u máº«u.
        </p>
      ) : null}
      {ordersError ? <p className="form-error">{ordersError}</p> : null}

      <div className="profile-order-list">
        {filteredOrders.map((order) => {
          const firstItem = order.items[0] || {}
          const otherItemCount = Math.max(order.items.length - 1, 0)

          return (
            <article className="profile-order-card" key={order.id}>
              <div className="order-product-symbol">{firstItem.image || 'DH'}</div>

              <div className="profile-order-main">
                <div className="profile-order-title">
                  <div>
                    <span>MÃ£ Ä‘Æ¡n hÃ ng</span>
                    <strong>{order.id}</strong>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                </div>
                <p>
                  {firstItem.name || 'ÄÆ¡n hÃ ng'}
                  {otherItemCount > 0 ? ` vÃ  ${otherItemCount} sáº£n pháº©m khÃ¡c` : ''}
                </p>
                <div className="profile-order-meta">
                  <span>NgÃ y Ä‘áº·t: {order.orderDate}</span>
                  <span>Tá»•ng tiá»n: {formatCurrency(order.total)}</span>
                  <span>Thanh toÃ¡n: {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                  <span>TT thanh toÃ¡n: {paymentStatusLabels[order.paymentStatus] || order.paymentStatus || 'Äang cáº­p nháº­t'}</span>
                  <span>{order.items.length} sáº£n pháº©m</span>
                </div>
                {order.paymentMethod === 'chuyenKhoan' && order.paymentStatus === 'choThanhToan' ? (
                  <p className="product-result-summary">Chá» nhÃ¢n viÃªn xÃ¡c nháº­n chuyá»ƒn khoáº£n</p>
                ) : null}
                {order.status === 'khachDaNhan' ? (
                  <p className="product-result-summary">Chá» nhÃ¢n viÃªn hoÃ n táº¥t Ä‘Æ¡n</p>
                ) : null}
              </div>

              <div className="profile-order-actions">
                <Link className="button secondary" to={`/orders/${order.id}`}>
                  Xem chi tiáº¿t
                </Link>
                {order.status === 'choXacNhan' ? (
                  <button type="button" onClick={() => setCancelTargetOrder(order)}>
                    Há»§y Ä‘Æ¡n
                  </button>
                ) : null}
                {order.status === 'daGiao' ? (
                  <button type="button" onClick={() => navigate(`/orders/${order.id}`)}>
                    YÃªu cáº§u hoÃ n hÃ ng
                  </button>
                ) : null}
                {order.status === 'dangGiao' ? (
                  <button type="button" onClick={() => handleConfirmReceived(order)}>
                    ÄÃ£ nháº­n hÃ ng
                  </button>
                ) : null}
                {order.paymentMethod === 'vi' && order.paymentStatus === 'choThanhToan' ? (
                  <button type="button" onClick={() => handleConfirmWalletPayment(order)}>
                    XÃ¡c nháº­n thanh toÃ¡n vÃ­
                  </button>
                ) : null}
              </div>
            </article>
          )
        })}
        {filteredOrders.length === 0 && !isOrdersLoading ? (
          <section className="empty-products">
            <h2>ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng phÃ¹ há»£p</h2>
            <p>HÃ£y thá»­ chá»n tráº¡ng thÃ¡i khÃ¡c hoáº·c quay láº¡i mua sáº¯m.</p>
          </section>
        ) : null}
      </div>
    </section>
  )

  const renderAddresses = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Giao hang</span>
        <h2>Dia chi cua toi</h2>
      </div>
      <div className="address-card">
        <strong>{profileUser.name || 'Khach hang demo'}</strong>
        <p>{profileUser.phone || 'Dang cap nhat'}</p>
        <p>{profileUser.diaChi || profileUser.address || 'Dang cap nhat'}</p>
        <span>Mac dinh</span>
      </div>
      <form className="profile-edit-form" onSubmit={saveProfile}>
        <label>
          Ho va ten
          <input value={profileForm.name} onChange={(event) => updateProfileField('name', event.target.value)} />
        </label>
        <label>
          Email
          <input value={profileForm.email} onChange={(event) => updateProfileField('email', event.target.value)} />
        </label>
        <label>
          So dien thoai
          <input value={profileForm.phone} onChange={(event) => updateProfileField('phone', event.target.value)} />
        </label>
        <label>
          Ngay sinh
          <input type="date" value={profileForm.birthday || ''} onChange={(event) => updateProfileField('birthday', event.target.value)} />
        </label>
        <label className="profile-edit-full">
          Dia chi mac dinh
          <input value={profileForm.diaChi} onChange={(event) => updateProfileField('diaChi', event.target.value)} />
        </label>
        {profileError ? <p className="form-error profile-edit-full">{profileError}</p> : null}
        {profileMessage ? <p className="form-success profile-edit-full">{profileMessage}</p> : null}
        <button className="button profile-edit-full" type="submit" disabled={isProfileSaving}>
          {isProfileSaving ? 'Dang luu...' : 'Luu thong tin'}
        </button>
      </form>
    </section>
  )

  const renderPoints = () => (
    <section className="profile-panel points-panel">
      <div className="profile-panel-heading">
        <span>Æ¯u Ä‘Ã£i thÃ nh viÃªn</span>
        <h2>Äiá»ƒm tÃ­ch lÅ©y</h2>
      </div>
      <strong>{Number(profileUser.loyaltyPoints || 0).toLocaleString('vi-VN')} Ä‘iá»ƒm</strong>
      <p>DÃ¹ng Ä‘iá»ƒm Ä‘á»ƒ Ä‘á»•i voucher giáº£m giÃ¡ cho cÃ¡c Ä‘Æ¡n Ä‘áº·c sáº£n tiáº¿p theo.</p>
    </section>
  )

  const renderReviews = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Pháº£n há»“i</span>
        <h2>ÄÃ¡nh giÃ¡ cá»§a tÃ´i</h2>
      </div>

      {isReviewsLoading ? <p className="product-result-summary">Äang táº£i Ä‘Ã¡nh giÃ¡...</p> : null}
      {hasReviewsApiError ? (
        <p className="product-result-summary">
          KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c backend, Ä‘ang dÃ¹ng dá»¯ liá»‡u máº«u náº¿u cÃ³.
        </p>
      ) : null}
      {reviewsError && !hasReviewsApiError ? <p className="form-error">{reviewsError}</p> : null}

      <div className="profile-review-list">
        {reviews.map((review) => (
          <article className="review-card profile-review-card" key={review.id || `${review.productName}-${review.reviewDate}`}>
            <div className="review-product-image">
              <ReviewImage value={review.productImage} label={review.productName} />
            </div>
            <div className="profile-review-main">
              <div className="profile-review-title">
                <strong>{review.productName}</strong>
                <span className={`review-status-badge ${review.approved ? 'approved' : 'pending'}`}>
                  {review.approved ? 'ÄÃ£ duyá»‡t' : 'Chá» duyá»‡t'}
                </span>
              </div>
              <small>{review.variantName || review.variant || 'Máº·c Ä‘á»‹nh'}</small>
              <b>{renderStars(review.rating)} <small>{Number(review.rating || 0)}/5</small></b>
              <p>{review.content || 'KhÃ´ng cÃ³ ná»™i dung Ä‘Ã¡nh giÃ¡.'}</p>
              <time>{formatDate(review.reviewDate)}</time>
            </div>
          </article>
        ))}

        {reviews.length === 0 && !isReviewsLoading ? (
          <section className="empty-products">
            <h2>Báº¡n chÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o.</h2>
          </section>
        ) : null}
      </div>
    </section>
  )

  const renderCombos = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>QuÃ  táº·ng</span>
        <h2>Combo cá»§a tÃ´i</h2>
      </div>

      {isCombosLoading ? <p className="product-result-summary">Äang táº£i combo...</p> : null}
      {hasCombosApiError ? (
        <p className="product-result-summary">
          KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c backend combo, Ä‘ang dÃ¹ng dá»¯ liá»‡u máº«u náº¿u cÃ³.
        </p>
      ) : null}
      {combosError && !hasCombosApiError ? <p className="form-error">{combosError}</p> : null}

      <div className="profile-combo-grid">
        {combos.map((combo) => (
          <article className="profile-combo-card" key={combo.id}>
            <div className="profile-combo-head">
              <div>
                <span>{combo.occasion}</span>
                <h3>{combo.name}</h3>
              </div>
              <b>{comboStatusLabels[combo.trangThaiCombo] || combo.trangThaiCombo}</b>
            </div>
            <p>{combo.message}</p>
            <p>{combo.loaiCombo || combo.type || 'Combo quÃ  táº·ng'}</p>
            {combo.createdAt ? <p>NgÃ y táº¡o: {formatDate(combo.createdAt)}</p> : null}
            <ul>
              {(combo.items || []).slice(0, 3).map((item) => (
                <li key={item.id}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
            <div className="profile-combo-footer">
              <strong>{formatCurrency(combo.total)}</strong>
              <button type="button" onClick={() => loadComboDetail(combo)}>
                Xem chi tiáº¿t
              </button>
            </div>
            {combo.trangThaiCombo === 'luuTam' ? (
              <button type="button" onClick={() => orderComboNow(combo)}>
                Äáº·t ngay
              </button>
            ) : null}
            {combo.trangThaiCombo === 'daDatHang' ? <p>ÄÃ£ Ä‘áº·t hÃ ng</p> : null}
            {combo.trangThaiCombo === 'daHuy' ? <p>ÄÃ£ há»§y</p> : null}
          </article>
        ))}
        {combos.length === 0 && !isCombosLoading ? (
          <section className="empty-products">
            <h2>Báº¡n chÆ°a cÃ³ combo nÃ o.</h2>
          </section>
        ) : null}
      </div>
    </section>
  )

  const tabContent = {
    info: renderInfo,
    orders: renderOrders,
    addresses: renderAddresses,
    points: renderPoints,
    reviews: renderReviews,
    combos: renderCombos,
  }

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="profile-user">
          <span>{(profileUser.name || profileUser.email || 'U').charAt(0)}</span>
          <div>
            <strong>{profileUser.name || 'KhÃ¡ch hÃ ng demo'}</strong>
            <small>{profileUser.email || 'ChÆ°a Ä‘Äƒng nháº­p'}</small>
          </div>
        </div>

        <nav className="profile-nav">
          {accountTabs.map((tab) => (
            <button
              className={activeTab === tab.id ? 'active' : ''}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button type="button" onClick={handleLogout}>
            ÄÄƒng xuáº¥t
          </button>
        </nav>
      </aside>

      <main className="profile-content">{tabContent[activeTab]()}</main>

      {cancelTargetOrder ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={submitCancelOrder}>
            <div className="profile-panel-heading">
              <span>Há»§y Ä‘Æ¡n hÃ ng</span>
              <h2>{cancelTargetOrder.id}</h2>
            </div>
            <label>
              LÃ½ do há»§y
              <input
                required
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="VÃ­ dá»¥: TÃ´i muá»‘n thay Ä‘á»•i Ä‘á»‹a chá»‰ giao hÃ ng"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setCancelTargetOrder(null)}>
                ÄÃ³ng
              </button>
              <button className="button" type="submit">
                XÃ¡c nháº­n há»§y
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedCombo ? (
        <div className="profile-modal-backdrop" role="presentation">
          <div className="profile-modal">
            <div className="profile-panel-heading">
              <span>{comboStatusLabels[selectedCombo.trangThaiCombo] || selectedCombo.trangThaiCombo}</span>
              <h2>{selectedCombo.name}</h2>
            </div>
            <p>{selectedCombo.message}</p>
            <p>{selectedCombo.loaiCombo || selectedCombo.type}</p>
            <p>{selectedCombo.occasion}</p>
            <div className="combo-detail-list">
              {(selectedCombo.items || []).map((item) => (
                <span key={item.id}>{item.name} Â· {item.variantName} x {item.quantity}</span>
              ))}
            </div>
            <strong>Tá»•ng tiá»n: {formatCurrency(selectedCombo.total)}</strong>
            <div className="modal-actions">
              <button type="button" onClick={() => setSelectedCombo(null)}>
                ÄÃ³ng
              </button>
              {selectedCombo.trangThaiCombo === 'luuTam' ? (
                <button className="button" type="button" onClick={() => orderComboNow(selectedCombo)}>
                  Äáº·t ngay
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProfilePage
