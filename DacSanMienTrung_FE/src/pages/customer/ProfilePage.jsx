import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockPurchasedCombos } from '../../data/mockCombos'
import { mockOrders } from '../../data/mockOrders'
import { mockCurrentUser } from '../../data/mockUsers'
import { getUserById } from '../../services/authService'
import {
  cancelOrder as cancelOrderApi,
  getOrdersByUser,
  orderStatusLabels,
  orderStatusOptions,
  normalizeOrderStatus,
} from '../../services/orderService'
import { getCurrentUser, getCurrentUserId, logout, normalizeUser } from '../../utils/authStorage'
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
  role: user.role || user.vaiTro || 'khachhang',
  loyaltyPoints: Number(user.loyaltyPoints || user.diemTichLuy || 0),
  customerType: user.customerType || user.phanLoaiKhachHang || 'Thân thiết',
  createdAt: user.createdAt || user.ngayDangKy || '',
})
const normalizeMockOrder = (order) => ({
  ...order,
  status: normalizeOrderStatus(order.status),
  total: order.total ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee - order.discount,
})
const fallbackOrders = mockOrders.map(normalizeMockOrder)

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
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedCombo, setSelectedCombo] = useState(null)

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

  const handleLogout = () => {
    logout()
    navigate('/login')
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
                  <span>Thanh toán: {order.paymentMethod}</span>
                  <span>{order.items.length} sản phẩm</span>
                </div>
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
        <p>{profileUser.address || profileUser.diaChi || 'Đang cập nhật'}</p>
        <span>Mặc định</span>
      </div>
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
      <div className="review-card">
        <strong>Mực rim me Đà Nẵng</strong>
        <p>Vị vừa miệng, đóng gói chắc chắn. Sẽ mua lại cho dịp lễ.</p>
        <span>5/5 sao</span>
      </div>
    </section>
  )

  const renderCombos = () => (
    <section className="profile-panel">
      <div className="profile-panel-heading">
        <span>Quà tặng</span>
        <h2>Combo quà tặng</h2>
      </div>

      <div className="profile-combo-grid">
        {mockPurchasedCombos.map((combo) => (
          <article className="profile-combo-card" key={combo.id}>
            <div className="profile-combo-head">
              <div>
                <span>{combo.occasion}</span>
                <h3>{combo.name}</h3>
              </div>
              <b>{combo.status}</b>
            </div>
            <p>{combo.message}</p>
            <ul>
              {combo.products.slice(0, 3).map((product) => (
                <li key={product}>{product}</li>
              ))}
            </ul>
            <div className="profile-combo-footer">
              <strong>{formatCurrency(combo.total)}</strong>
              <button type="button" onClick={() => setSelectedCombo(combo)}>
                Xem chi tiết
              </button>
            </div>
          </article>
        ))}
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
              <span>{selectedCombo.status}</span>
              <h2>{selectedCombo.name}</h2>
            </div>
            <p>{selectedCombo.message}</p>
            <div className="combo-detail-list">
              {selectedCombo.products.map((product) => (
                <span key={product}>{product}</span>
              ))}
            </div>
            <strong>Tổng tiền: {formatCurrency(selectedCombo.total)}</strong>
            <div className="modal-actions">
              <button type="button" onClick={() => setSelectedCombo(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProfilePage
