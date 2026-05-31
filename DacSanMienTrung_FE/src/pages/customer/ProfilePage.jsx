import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockPurchasedCombos } from '../../data/mockCombos'
import {
  getOrderTotal,
  mockOrders,
  orderStatusLabels,
  orderStatusOptions,
} from '../../data/mockOrders'
import { mockCurrentUser } from '../../data/mockUsers'
import './ProfilePage.css'

const accountTabs = [
  { id: 'info', label: 'Thông tin cá nhân' },
  { id: 'orders', label: 'Đơn hàng' },
  { id: 'addresses', label: 'Địa chỉ' },
  { id: 'points', label: 'Điểm tích lũy' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'combos', label: 'Combo quà tặng' },
]

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')
  const [orderFilter, setOrderFilter] = useState('all')
  const [orders, setOrders] = useState(mockOrders)
  const [returnOrder, setReturnOrder] = useState(null)
  const [returnForm, setReturnForm] = useState({ reason: '', detail: '' })
  const [selectedCombo, setSelectedCombo] = useState(null)

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') {
      return orders
    }
    return orders.filter((order) => order.status === orderFilter)
  }, [orderFilter, orders])

  const cancelOrder = (orderId) => {
    const confirmed = window.confirm('Bạn có chắc muốn hủy đơn hàng này?')
    if (!confirmed) {
      return
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order,
      ),
    )
  }

  const submitReturnRequest = (event) => {
    event.preventDefault()
    if (!returnOrder) {
      return
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === returnOrder.id ? { ...order, status: 'returning' } : order,
      ),
    )
    setReturnOrder(null)
    setReturnForm({ reason: '', detail: '' })
    setOrderFilter('returning')
    setActiveTab('orders')
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
          <strong>{mockCurrentUser.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{mockCurrentUser.email}</strong>
        </div>
        <div>
          <span>Số điện thoại</span>
          <strong>{mockCurrentUser.phone}</strong>
        </div>
        <div>
          <span>Ngày sinh</span>
          <strong>{mockCurrentUser.birthday}</strong>
        </div>
        <div>
          <span>Giới tính</span>
          <strong>{mockCurrentUser.gender}</strong>
        </div>
        <div>
          <span>Hạng thành viên</span>
          <strong>Thân thiết</strong>
        </div>
      </div>
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
            onClick={() => setOrderFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="profile-order-list">
        {filteredOrders.map((order) => {
          const firstItem = order.items[0]
          const otherItemCount = Math.max(order.items.length - 1, 0)

          return (
            <article className="profile-order-card" key={order.id}>
              <div className="order-product-symbol">{firstItem.image}</div>

              <div className="profile-order-main">
                <div className="profile-order-title">
                  <div>
                    <span>Mã đơn hàng</span>
                    <strong>{order.id}</strong>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {orderStatusLabels[order.status]}
                  </span>
                </div>
                <p>
                  {firstItem.name}
                  {otherItemCount > 0 ? ` và ${otherItemCount} sản phẩm khác` : ''}
                </p>
                <div className="profile-order-meta">
                  <span>Ngày đặt: {order.orderDate}</span>
                  <span>Tổng tiền: {formatCurrency(getOrderTotal(order))}</span>
                </div>
              </div>

              <div className="profile-order-actions">
                <Link className="button secondary" to={`/orders/${order.id}`}>
                  Xem chi tiết
                </Link>
                {order.status === 'pending' ? (
                  <button type="button" onClick={() => cancelOrder(order.id)}>
                    Hủy đơn
                  </button>
                ) : null}
                {order.status === 'completed' ? (
                  <>
                    <button type="button">Đánh giá</button>
                    <button type="button" onClick={() => setReturnOrder(order)}>
                      Yêu cầu hoàn hàng
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          )
        })}
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
        <strong>{mockCurrentUser.name}</strong>
        <p>{mockCurrentUser.phone}</p>
        <p>{mockCurrentUser.address}</p>
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
      <strong>{mockCurrentUser.loyaltyPoints.toLocaleString('vi-VN')} điểm</strong>
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
          <span>{mockCurrentUser.name.charAt(0)}</span>
          <div>
            <strong>{mockCurrentUser.name}</strong>
            <small>{mockCurrentUser.email}</small>
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
          <button type="button" onClick={() => navigate('/login')}>
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main className="profile-content">{tabContent[activeTab]()}</main>

      {returnOrder ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={submitReturnRequest}>
            <div className="profile-panel-heading">
              <span>Yêu cầu hoàn hàng</span>
              <h2>{returnOrder.id}</h2>
            </div>
            <label>
              Lý do hoàn hàng
              <input
                required
                value={returnForm.reason}
                onChange={(event) =>
                  setReturnForm((current) => ({ ...current, reason: event.target.value }))
                }
                placeholder="Ví dụ: sản phẩm không đúng quy cách"
              />
            </label>
            <label>
              Mô tả chi tiết
              <textarea
                required
                rows="4"
                value={returnForm.detail}
                onChange={(event) =>
                  setReturnForm((current) => ({ ...current, detail: event.target.value }))
                }
                placeholder="Mô tả tình trạng sản phẩm hoặc mong muốn hỗ trợ"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setReturnOrder(null)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Gửi yêu cầu
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
