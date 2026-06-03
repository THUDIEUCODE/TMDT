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
  { id: 'info', label: 'Thông tin cá nhân' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'addresses', label: 'Địa chỉ' },
  { id: 'points', label: 'Điểm tích lũy' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'combos', label: 'Combo quà tặng' },
]

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const normalizeMockUser = (user) => ({
  ...user,
  name: user.name || user.hoTen || '',
  phone: user.phone || user.soDienThoai || '',
  diaChi: user.diaChi || user.address || '',
  address: user.diaChi || user.address || '',
  role: user.role || user.vaiTro || 'khachhang',
  loyaltyPoints: Number(user.loyaltyPoints || user.diemTichLuy || 0),
  customerType: user.customerType || user.phanLoaiKhachHang || 'Thân thiết',
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
      combo.status === 'Đã mua' || combo.status === 'Đã mua'
        ? 'daDatHang'
        : combo.status === 'Đã hủy'
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
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const renderStars = (rating) => '★'.repeat(Math.max(0, Math.min(5, Number(rating || 0))))

const ReviewImage = ({ value, label }) => (
  <img src={getImageUrl(value)} alt={label || 'Sản phẩm'} onError={handleImageError} />
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
      setOrdersError('Vui lòng nhập lý do hủy đơn.')
      return
    }

    try {
      await cancelOrderApi(cancelTargetOrder.id, { lyDoHuy: cancelReason.trim() })
      setCancelTargetOrder(null)
      setCancelReason('')
      await loadOrders()
    } catch (error) {
      setOrdersError(error?.message || 'Không thể hủy đơn hàng.')
    }
  }

  const handleConfirmReceived = async (order) => {
    if (!window.confirm('Xác nhận bạn đã nhận được hàng?')) {
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
      setOrdersError(error?.message || 'Không thể xác nhận nhận hàng.')
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
      setOrdersError(error?.message || 'Không thể xác nhận thanh toán ví.')
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
      setProfileMessage('Đã cập nhật thông tin cá nhân.')
    } catch (error) {
      setProfileError(error?.message || 'Không thể cập nhật thông tin cá nhân.')
    } finally {
      setIsProfileSaving(false)
    }
  }

  const loadComboDetail = async (combo) => {
    setSelectedCombo(combo)

    try {
      setSelectedCombo(await getComboById(combo.id))
    } catch (error) {
      setCombosError(error?.message || 'Không thể tải chi tiết combo.')
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
        setCombosError('Combo chưa có sản phẩm.')
        return
      }

      if (!window.confirm('Bạn muốn đưa combo này vào giỏ hàng và chuyển sang thanh toán?')) {
        return
      }

      try {
        await clearCart(maNguoiDung)
      } catch {
        setCombosError('Hệ thống đang bận, vui lòng thử lại.')
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
      setCombosError(error?.message || 'Không thể đưa combo vào giỏ hàng.')
    } finally {
      setIsCombosLoading(false)
    }
  }

  const renderInfo = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Tài khoản</span>
        <h2>Thông tin cá nhân</h2>
      </div>

      <div className="profile-info-grid">
        <div>
          <span>Họ và tên</span>
          <strong>{profileUser.name || 'Khách hàng demo'}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{profileUser.email || 'Đang cập nhật'}</strong>
        </div>
        <div>
          <span>Số điện thoại</span>
          <strong>{profileUser.phone || 'Đang cập nhật'}</strong>
        </div>
        <div>
          <span>Ngày sinh</span>
          <strong>{profileUser.birthday || 'Đang cập nhật'}</strong>
        </div>
        <div>
          <span>Vai trò</span>
          <strong>{profileUser.role || 'khachhang'}</strong>
        </div>
        <div>
          <span>Điểm tích lũy</span>
          <strong>{Number(profileUser.loyaltyPoints || 0).toLocaleString('vi-VN')} điểm</strong>
        </div>
        <div>
          <span>Phân loại khách hàng</span>
          <strong>{profileUser.customerType || 'Đang cập nhật'}</strong>
        </div>
        <div>
          <span>Ngày đăng ký</span>
          <strong>{profileUser.createdAt || 'Đang cập nhật'}</strong>
        </div>
      </div>
      {hasUserApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng thông tin tài khoản lưu cục bộ hoặc dữ liệu mẫu.
        </p>
      ) : null}
    </section>
  )

  const renderOrders = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <div>
          <span>Lịch sử mua hàng</span>
          <h2>Đơn hàng của tôi</h2>
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

      {isOrdersLoading ? <p className="product-result-summary">Đang tải đơn hàng...</p> : null}
      {hasOrdersApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
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
                    <span>Mã đơn hàng</span>
                    <strong>{order.id}</strong>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {orderStatusLabels[order.status] || order.status}
                  </span>
                </div>
                <p>
                  {firstItem.name || 'Đơn hàng'}
                  {otherItemCount > 0 ? ` và ${otherItemCount} sản phẩm khác` : ''}
                </p>
                <div className="profile-order-meta">
                  <span>Ngày đặt: {order.orderDate}</span>
                  <span>Tổng tiền: {formatCurrency(order.total)}</span>
                  <span>Thanh toán: {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                  <span>TT thanh toán: {paymentStatusLabels[order.paymentStatus] || order.paymentStatus || 'Đang cập nhật'}</span>
                  <span>{order.items.length} sản phẩm</span>
                </div>
                {order.paymentMethod === 'chuyenKhoan' && order.paymentStatus === 'choThanhToan' ? (
                  <p className="product-result-summary">Chờ nhân viên xác nhận chuyển khoản</p>
                ) : null}
                {order.status === 'khachDaNhan' ? (
                  <p className="product-result-summary">Chờ nhân viên hoàn tất đơn</p>
                ) : null}
              </div>

              <div className="profile-order-actions">
                <Link className="button secondary" to={`/orders/${order.id}`}>
                  Xem chi tiết
                </Link>
                {order.status === 'choXacNhan' ? (
                  <button type="button" onClick={() => setCancelTargetOrder(order)}>
                    Hủy đơn
                  </button>
                ) : null}
                {order.status === 'daGiao' ? (
                  <button type="button" onClick={() => navigate(`/orders/${order.id}`)}>
                    Yêu cầu hoàn hàng
                  </button>
                ) : null}
                {order.status === 'dangGiao' ? (
                  <button type="button" onClick={() => handleConfirmReceived(order)}>
                    Đã nhận hàng
                  </button>
                ) : null}
                {order.paymentMethod === 'vi' && order.paymentStatus === 'choThanhToan' ? (
                  <button type="button" onClick={() => handleConfirmWalletPayment(order)}>
                    Xác nhận thanh toán ví
                  </button>
                ) : null}
              </div>
            </article>
          )
        })}
        {filteredOrders.length === 0 && !isOrdersLoading ? (
          <section className="empty-products">
            <h2>Chưa có đơn hàng phù hợp</h2>
            <p>Hãy thử chọn trạng thái khác hoặc quay lại mua sắm.</p>
          </section>
        ) : null}
      </div>
    </section>
  )

  const renderAddresses = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Giao hàng</span>
        <h2>Địa chỉ của tôi</h2>
      </div>
      <div className="address-card">
        <strong>{profileUser.name || 'Khách hàng demo'}</strong>
        <p>{profileUser.phone || 'Đang cập nhật'}</p>
        <p>{profileUser.diaChi || profileUser.address || 'Đang cập nhật'}</p>
        <span>Mặc định</span>
      </div>
      <form className="profile-edit-form" onSubmit={saveProfile}>
        <label>
          Họ và tên
          <input value={profileForm.name} onChange={(event) => updateProfileField('name', event.target.value)} />
        </label>
        <label>
          Email
          <input value={profileForm.email} onChange={(event) => updateProfileField('email', event.target.value)} />
        </label>
        <label>
          Số điện thoại
          <input value={profileForm.phone} onChange={(event) => updateProfileField('phone', event.target.value)} />
        </label>
        <label>
          Ngày sinh
          <input type="date" value={profileForm.birthday || ''} onChange={(event) => updateProfileField('birthday', event.target.value)} />
        </label>
        <label className="profile-edit-full">
          Địa chỉ mặc định
          <input value={profileForm.diaChi} onChange={(event) => updateProfileField('diaChi', event.target.value)} />
        </label>
        {profileError ? <p className="form-error profile-edit-full">{profileError}</p> : null}
        {profileMessage ? <p className="form-success profile-edit-full">{profileMessage}</p> : null}
        <button className="button profile-edit-full" type="submit" disabled={isProfileSaving}>
          {isProfileSaving ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </form>
    </section>
  )

  const renderPoints = () => (
    <section className="profile-panel points-panel">
      <div className="profile-panel-heading">
        <span>Ưu đãi thành viên</span>
        <h2>Điểm tích lũy</h2>
      </div>
      <strong>{Number(profileUser.loyaltyPoints || 0).toLocaleString('vi-VN')} điểm</strong>
      <p>Dùng điểm để đổi voucher giảm giá cho các đơn đặc sản tiếp theo.</p>
    </section>
  )

  const renderReviews = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Phản hồi</span>
        <h2>Đánh giá của tôi</h2>
      </div>

      {isReviewsLoading ? <p className="product-result-summary">Đang tải đánh giá...</p> : null}
      {hasReviewsApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu nếu có.
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
                  {review.approved ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
              </div>
              <small>{review.variantName || review.variant || 'Mặc định'}</small>
              <b>{renderStars(review.rating)} <small>{Number(review.rating || 0)}/5</small></b>
              <p>{review.content || 'Không có nội dung đánh giá.'}</p>
              <time>{formatDate(review.reviewDate)}</time>
            </div>
          </article>
        ))}

        {reviews.length === 0 && !isReviewsLoading ? (
          <section className="empty-products">
            <h2>Bạn chưa có đánh giá nào.</h2>
          </section>
        ) : null}
      </div>
    </section>
  )

  const renderCombos = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Quà tặng</span>
        <h2>Combo của tôi</h2>
      </div>

      {isCombosLoading ? <p className="product-result-summary">Đang tải combo...</p> : null}
      {hasCombosApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend combo, đang dùng dữ liệu mẫu nếu có.
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
            <p>{combo.loaiCombo || combo.type || 'Combo quà tặng'}</p>
            {combo.createdAt ? <p>Ngày tạo: {formatDate(combo.createdAt)}</p> : null}
            <ul>
              {(combo.items || []).slice(0, 3).map((item) => (
                <li key={item.id}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
            {combo.trangThaiCombo === 'luuTam' ? (
              <button type="button" onClick={() => orderComboNow(combo)}>
                Đặt ngay
              </button>
            ) : null}
            {combo.trangThaiCombo === 'daDatHang' ? <p>Đã đặt hàng</p> : null}
            {combo.trangThaiCombo === 'daHuy' ? <p>Đã hủy</p> : null}
          </article>
        ))}
        {combos.length === 0 && !isCombosLoading ? (
          <section className="empty-products">
            <h2>Bạn chưa có combo nào.</h2>
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
            <strong>{profileUser.name || 'Khách hàng demo'}</strong>
            <small>{profileUser.email || 'Chưa đăng nhập'}</small>
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
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main className="profile-content">{tabContent[activeTab]()}</main>

      {cancelTargetOrder ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={submitCancelOrder}>
            <div className="profile-panel-heading">
              <span>Hủy đơn hàng</span>
              <h2>{cancelTargetOrder.id}</h2>
            </div>
            <label>
              Lý do hủy
              <input
                required
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Ví dụ: Tôi muốn thay đổi địa chỉ giao hàng"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setCancelTargetOrder(null)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Xác nhận hủy
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
                <span key={item.id}>{item.name} · {item.variantName} x {item.quantity}</span>
              ))}
            </div>
            <strong>Tổng tiền: {formatCurrency(selectedCombo.total)}</strong>
            <div className="modal-actions">
              <button type="button" onClick={() => setSelectedCombo(null)}>
                Đóng
              </button>
              {selectedCombo.trangThaiCombo === 'luuTam' ? (
                <button className="button" type="button" onClick={() => orderComboNow(selectedCombo)}>
                  Đặt ngay
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
