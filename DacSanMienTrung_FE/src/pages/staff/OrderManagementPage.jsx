import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getOrderSubtotal,
  getOrderTotal,
  mockOrders,
  orderStatusLabels,
} from '../../data/mockOrders'
import './OrderManagementPage.css'

const paymentOptions = ['COD', 'Chuyển khoản', 'Ví điện tử']

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: orderStatusLabels.pending },
  { value: 'confirmed', label: orderStatusLabels.confirmed },
  { value: 'shipping', label: orderStatusLabels.shipping },
  { value: 'completed', label: orderStatusLabels.completed },
  { value: 'cancelled', label: orderStatusLabels.cancelled },
  { value: 'returning', label: orderStatusLabels.returning },
]

function OrderManagementPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [cancelOrder, setCancelOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  const stats = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        result.total += 1
        result[order.status] += 1
        return result
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0,
        returning: 0,
      },
    )
  }, [orders])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.code.toLowerCase().includes(normalizedSearch) ||
        order.customerName.toLowerCase().includes(normalizedSearch) ||
        order.phone.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter

      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [orders, paymentFilter, searchTerm, statusFilter])

  const changeOrderStatus = (orderId, nextStatus, label) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              statusHistory: [
                ...order.statusHistory,
                { time: new Date().toLocaleString('vi-VN'), label },
              ],
              timeline: [
                ...order.statusHistory,
                { time: new Date().toLocaleString('vi-VN'), label },
              ],
            }
          : order,
      ),
    )
  }

  const openCancelModal = (order) => {
    setCancelOrder(order)
    setCancelReason('')
    setCancelError('')
  }

  const submitCancelOrder = (event) => {
    event.preventDefault()

    if (!cancelReason.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đơn.')
      return
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === cancelOrder.id
          ? {
              ...order,
              status: 'cancelled',
              cancelReason: cancelReason.trim(),
              statusHistory: [
                ...order.statusHistory,
                { time: new Date().toLocaleString('vi-VN'), label: 'Nhân viên đã hủy đơn' },
              ],
              timeline: [
                ...order.statusHistory,
                { time: new Date().toLocaleString('vi-VN'), label: 'Nhân viên đã hủy đơn' },
              ],
            }
          : order,
      ),
    )
    setCancelOrder(null)
    setCancelReason('')
    setCancelError('')
  }

  const renderActions = (order) => (
    <div className="staff-order-actions">
      <button type="button" onClick={() => setDetailOrder(order)}>
        Xem chi tiết
      </button>
      {order.status === 'pending' ? (
        <>
          <button
            type="button"
            onClick={() => changeOrderStatus(order.id, 'confirmed', 'Nhân viên đã xác nhận đơn hàng')}
          >
            Xác nhận
          </button>
          <button type="button" onClick={() => openCancelModal(order)}>
            Hủy đơn
          </button>
        </>
      ) : null}
      {order.status === 'confirmed' ? (
        <button
          type="button"
          onClick={() => changeOrderStatus(order.id, 'shipping', 'Đơn hàng chuyển sang giao hàng')}
        >
          Giao hàng
        </button>
      ) : null}
      {order.status === 'shipping' ? (
        <button
          type="button"
          onClick={() => changeOrderStatus(order.id, 'completed', 'Đơn hàng đã hoàn tất')}
        >
          Hoàn tất
        </button>
      ) : null}
      {order.status === 'returning' ? (
        <Link to="/staff/returns">Xử lý hoàn</Link>
      ) : null}
    </div>
  )

  return (
    <div className="order-management-page">
      <section className="order-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi, xác nhận và cập nhật tiến trình xử lý đơn hàng của khách.</p>
        </div>
      </section>

      <section className="staff-order-stat-grid">
        <article>
          <span>Tổng đơn hàng</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Chờ xác nhận</span>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Đã xác nhận</span>
          <strong>{stats.confirmed}</strong>
        </article>
        <article>
          <span>Đang giao</span>
          <strong>{stats.shipping}</strong>
        </article>
        <article>
          <span>Đã giao</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Đã hủy</span>
          <strong>{stats.cancelled}</strong>
        </article>
        <article>
          <span>Đang hoàn hàng</span>
          <strong>{stats.returning}</strong>
        </article>
      </section>

      <section className="staff-order-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Mã đơn, tên khách hàng hoặc số điện thoại"
          />
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phương thức thanh toán
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {paymentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="staff-order-table-card">
        <div className="staff-order-table-summary">
          <strong>{filteredOrders.length} đơn hàng</strong>
          <span>Dữ liệu mock, thao tác cập nhật bằng state nội bộ.</span>
        </div>

        <div className="staff-order-management-table">
          <div className="staff-order-table-head">
            <span>Mã đơn hàng</span>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Ngày đặt</span>
            <span>Tổng tiền</span>
            <span>Thanh toán</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredOrders.map((order) => (
            <article className="staff-order-table-row" key={order.id}>
              <strong>{order.code}</strong>
              <span>{order.customerName}</span>
              <span>{order.phone}</span>
              <span>{order.orderDate}</span>
              <b>{formatCurrency(getOrderTotal(order))}</b>
              <span>{order.paymentMethod}</span>
              <span className={`staff-order-status staff-order-status-${order.status}`}>
                {orderStatusLabels[order.status]}
              </span>
              {renderActions(order)}
            </article>
          ))}
        </div>
      </section>

      {cancelOrder ? (
        <div className="staff-order-modal-backdrop" role="presentation">
          <form className="staff-order-modal" onSubmit={submitCancelOrder}>
            <div className="staff-order-modal-heading">
              <span>Hủy đơn hàng</span>
              <h2>{cancelOrder.code}</h2>
            </div>
            <label>
              Lý do hủy
              <textarea
                rows="4"
                value={cancelReason}
                onChange={(event) => {
                  setCancelReason(event.target.value)
                  setCancelError('')
                }}
                placeholder="Nhập lý do hủy đơn hàng"
              />
            </label>
            {cancelError ? <p className="staff-order-form-error">{cancelError}</p> : null}
            <div className="staff-order-modal-actions">
              <button type="button" onClick={() => setCancelOrder(null)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Xác nhận hủy
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detailOrder ? (
        <div className="staff-order-modal-backdrop" role="presentation">
          <section className="staff-order-modal staff-order-detail-modal">
            <div className="staff-order-modal-heading">
              <span>Chi tiết đơn hàng</span>
              <h2>{detailOrder.code}</h2>
            </div>

            <div className="staff-order-detail-grid">
              <div>
                <span>Ngày đặt</span>
                <strong>{detailOrder.orderDate}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{orderStatusLabels[detailOrder.status]}</strong>
              </div>
              <div>
                <span>Khách hàng</span>
                <strong>{detailOrder.customerName}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailOrder.phone}</strong>
              </div>
              <div className="staff-order-detail-full">
                <span>Địa chỉ nhận hàng</span>
                <strong>{detailOrder.address}</strong>
              </div>
              <div>
                <span>Thanh toán</span>
                <strong>{detailOrder.paymentMethod}</strong>
              </div>
              <div>
                <span>Ghi chú</span>
                <strong>{detailOrder.note || 'Không có'}</strong>
              </div>
            </div>

            <div className="staff-order-detail-items">
              <h3>Sản phẩm trong đơn</h3>
              {detailOrder.items.map((item) => (
                <div className="staff-order-detail-item" key={item.id}>
                  <span>{item.image}</span>
                  <strong>{item.name}</strong>
                  <small>{item.variant}</small>
                  <small>x{item.quantity}</small>
                  <small>{formatCurrency(item.price)}</small>
                  <b>{formatCurrency(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="staff-order-total-box">
              <div>
                <span>Tạm tính</span>
                <strong>{formatCurrency(getOrderSubtotal(detailOrder))}</strong>
              </div>
              <div>
                <span>Phí vận chuyển</span>
                <strong>{formatCurrency(detailOrder.shippingFee)}</strong>
              </div>
              <div>
                <span>Giảm giá/voucher</span>
                <strong>-{formatCurrency(detailOrder.discount)}</strong>
              </div>
              <div>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(getOrderTotal(detailOrder))}</strong>
              </div>
            </div>

            {detailOrder.cancelReason ? (
              <div className="staff-order-cancel-reason">
                <strong>Lý do hủy</strong>
                <p>{detailOrder.cancelReason}</p>
              </div>
            ) : null}

            <div className="staff-order-history">
              <h3>Lịch sử trạng thái</h3>
              {detailOrder.statusHistory.map((item) => (
                <div key={`${item.time}-${item.label}`}>
                  <span>{item.time}</span>
                  <strong>{item.label}</strong>
                </div>
              ))}
            </div>

            <div className="staff-order-modal-actions">
              <button type="button" onClick={() => setDetailOrder(null)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default OrderManagementPage
