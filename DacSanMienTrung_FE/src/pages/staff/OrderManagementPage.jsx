import { useCallback, useEffect, useMemo, useState } from 'react'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { mockOrders } from '../../data/mockOrders'
import {
  cancelOrder,
  getAllOrders,
  getOrderById,
  normalizeOrderStatus,
  orderStatusLabels,
  orderStatusOptions,
  updateOrderStatus,
} from '../../services/orderService'
import './OrderManagementPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatDate = (value) => {
  if (!value) {
    return 'Đang cập nhật'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const normalizeMockOrder = (order) => ({
  ...order,
  status: normalizeOrderStatus(order.status),
  customerName: order.customerName || order.receiverName,
  phone: order.phone || order.receiverPhone,
  paymentStatus: order.paymentStatus || 'Đang cập nhật',
  itemCount: order.itemCount || order.items.length,
  subtotal: order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  total:
    order.total ??
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
      order.shippingFee -
      order.discount,
  address: order.address || order.shippingAddress,
  district: order.district || '',
  province: order.province || '',
  returnStatus: order.returnStatus || 'khongCo',
  items: order.items.map((item) => ({
    ...item,
    total: item.total ?? item.price * item.quantity,
  })),
})
const fallbackOrders = mockOrders.map(normalizeMockOrder)

const staffStatusOptions = orderStatusOptions
const statusStatItems = [
  { key: 'total', label: 'Tổng đơn hàng' },
  { key: 'choXacNhan', label: orderStatusLabels.choXacNhan },
  { key: 'daXacNhan', label: orderStatusLabels.daXacNhan },
  { key: 'dangGiao', label: orderStatusLabels.dangGiao },
  { key: 'daGiao', label: orderStatusLabels.daGiao },
  { key: 'daHuy', label: orderStatusLabels.daHuy },
  { key: 'dangHoanHang', label: orderStatusLabels.dangHoanHang },
]

function OrderManagementPage() {
  const [orders, setOrders] = useState(fallbackOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [pendingActionId, setPendingActionId] = useState('')
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiOrders = await getAllOrders()
      setOrders(apiOrders)
      setHasApiError(false)
    } catch {
      setOrders(fallbackOrders)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadOrders()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [loadOrders])

  const stats = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        result.total += 1
        result[order.status] = (result[order.status] || 0) + 1
        return result
      },
      {
        total: 0,
        choXacNhan: 0,
        daXacNhan: 0,
        dangGiao: 0,
        daGiao: 0,
        daHuy: 0,
        dangHoanHang: 0,
      },
    )
  }, [orders])

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        String(order.code || order.id).toLowerCase().includes(normalizedSearch) ||
        (order.customerName || '').toLowerCase().includes(normalizedSearch) ||
        (order.phone || '').toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const openDetailModal = async (order) => {
    setActionError('')
    setActionMessage('')
    setDetailOrder(order)
    setIsDetailLoading(true)

    try {
      const apiOrder = await getOrderById(order.id)
      setDetailOrder(apiOrder)
    } catch {
      setDetailOrder(order)
    } finally {
      setIsDetailLoading(false)
    }
  }

  const changeOrderStatus = async (order, nextStatus) => {
    setActionError('')
    setActionMessage('')

    try {
      setPendingActionId(order.id)
      await updateOrderStatus(order.id, nextStatus)
      setActionMessage('Đã cập nhật trạng thái đơn hàng.')
      await loadOrders({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể cập nhật trạng thái đơn hàng.')
    } finally {
      setPendingActionId('')
    }
  }

  const openCancelModal = (order) => {
    setCancelTargetOrder(order)
    setCancelReason('')
    setActionError('')
    setActionMessage('')
  }

  const submitCancelOrder = async (event) => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')

    if (!cancelReason.trim()) {
      setActionError('Vui lòng nhập lý do hủy đơn.')
      return
    }

    try {
      setPendingActionId(cancelTargetOrder.id)
      await cancelOrder(cancelTargetOrder.id, { lyDoHuy: cancelReason.trim() })
      setCancelTargetOrder(null)
      setCancelReason('')
      setActionMessage('Đã hủy đơn hàng.')
      await loadOrders({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể hủy đơn hàng.')
    } finally {
      setPendingActionId('')
    }
  }

  const renderActions = (order) => (
    <div className="staff-order-actions">
      <button type="button" onClick={() => openDetailModal(order)}>
        Xem chi tiết
      </button>
      {order.status === 'choXacNhan' ? (
        <>
          <button
            type="button"
            disabled={pendingActionId === order.id}
            onClick={() => changeOrderStatus(order, 'daXacNhan')}
          >
            Xác nhận
          </button>
          <button type="button" disabled={pendingActionId === order.id} onClick={() => openCancelModal(order)}>
            Hủy đơn
          </button>
        </>
      ) : null}
      {order.status === 'daXacNhan' ? (
        <button
          type="button"
          disabled={pendingActionId === order.id}
          onClick={() => changeOrderStatus(order, 'dangGiao')}
        >
          Giao hàng
        </button>
      ) : null}
      {order.status === 'dangGiao' ? (
        <button
          type="button"
          disabled={pendingActionId === order.id}
          onClick={() => changeOrderStatus(order, 'daGiao')}
        >
          Hoàn tất
        </button>
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
        {statusStatItems.map((item) => (
          <article key={item.key}>
            <span>{item.label}</span>
            <strong>{stats[item.key] || 0}</strong>
          </article>
        ))}
      </section>

      {isLoading ? <p className="staff-order-message">Đang tải đơn hàng...</p> : null}
      {hasApiError ? (
        <p className="staff-order-message">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}
      {actionMessage ? <p className="staff-order-success">{actionMessage}</p> : null}
      {actionError ? <p className="staff-order-form-error">{actionError}</p> : null}

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
            {staffStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="staff-order-table-card">
        <div className="staff-order-table-summary">
          <strong>{filteredOrders.length} đơn hàng</strong>
          <span>Dữ liệu được tải từ backend khi kết nối thành công.</span>
        </div>

        <div className="staff-order-management-table">
          <div className="staff-order-table-head">
            <span>Mã đơn hàng</span>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Ngày đặt</span>
            <span>Tổng tiền</span>
            <span>Thanh toán</span>
            <span>TT thanh toán</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredOrders.map((order) => (
            <article className="staff-order-table-row" key={order.id}>
              <strong>{order.code || order.id}</strong>
              <span>{order.customerName}</span>
              <span>{order.phone}</span>
              <span>{formatDate(order.orderDate)}</span>
              <b>{formatCurrency(order.total)}</b>
              <span>{order.paymentMethod || 'Đang cập nhật'}</span>
              <span>{order.paymentStatus || 'Đang cập nhật'}</span>
              <OrderStatusBadge status={order.status} />
              {renderActions(order)}
            </article>
          ))}

          {filteredOrders.length === 0 && !isLoading ? (
            <section className="empty-products">
              <h2>Chưa có đơn hàng phù hợp</h2>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
            </section>
          ) : null}
        </div>
      </section>

      {cancelTargetOrder ? (
        <div className="staff-order-modal-backdrop" role="presentation">
          <form className="staff-order-modal" onSubmit={submitCancelOrder}>
            <div className="staff-order-modal-heading">
              <span>Hủy đơn hàng</span>
              <h2>{cancelTargetOrder.code || cancelTargetOrder.id}</h2>
            </div>
            <label>
              Lý do hủy
              <textarea
                rows="4"
                value={cancelReason}
                onChange={(event) => {
                  setCancelReason(event.target.value)
                  setActionError('')
                }}
                placeholder="Khách yêu cầu hủy đơn"
              />
            </label>
            <div className="staff-order-modal-actions">
              <button type="button" onClick={() => setCancelTargetOrder(null)}>
                Đóng
              </button>
              <button className="button" type="submit" disabled={pendingActionId === cancelTargetOrder.id}>
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
              <h2>{detailOrder.code || detailOrder.id}</h2>
            </div>

            {isDetailLoading ? <p className="staff-order-message">Đang tải chi tiết đơn...</p> : null}

            <div className="staff-order-detail-grid">
              <div>
                <span>Ngày đặt</span>
                <strong>{formatDate(detailOrder.orderDate)}</strong>
              </div>
              <div>
                <span>Trạng thái đơn hàng</span>
                <strong>{orderStatusLabels[detailOrder.status] || detailOrder.status}</strong>
              </div>
              <div>
                <span>Trạng thái thanh toán</span>
                <strong>{detailOrder.paymentStatus || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Người nhận</span>
                <strong>{detailOrder.receiverName || detailOrder.customerName}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailOrder.receiverPhone || detailOrder.phone}</strong>
              </div>
              <div className="staff-order-detail-full">
                <span>Địa chỉ giao hàng</span>
                <strong>{detailOrder.shippingAddress || detailOrder.address}</strong>
              </div>
              <div>
                <span>Quận/huyện</span>
                <strong>{detailOrder.district || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Tỉnh/thành</span>
                <strong>{detailOrder.province || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Phương thức thanh toán</span>
                <strong>{detailOrder.paymentMethod || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Ghi chú giao hàng</span>
                <strong>{detailOrder.note || 'Không có'}</strong>
              </div>
              {detailOrder.cancelReason ? (
                <div className="staff-order-detail-full">
                  <span>Lý do hủy</span>
                  <strong>{detailOrder.cancelReason}</strong>
                </div>
              ) : null}
              {detailOrder.returnReason ? (
                <div className="staff-order-detail-full">
                  <span>Lý do hoàn hàng</span>
                  <strong>{detailOrder.returnReason}</strong>
                </div>
              ) : null}
              {detailOrder.returnStatus && detailOrder.returnStatus !== 'khongCo' ? (
                <div>
                  <span>Trạng thái hoàn hàng</span>
                  <strong>{detailOrder.returnStatus}</strong>
                </div>
              ) : null}
            </div>

            <div className="staff-order-detail-items">
              <h3>Sản phẩm trong đơn</h3>
              {(detailOrder.items || []).map((item) => (
                <div className="staff-order-detail-item" key={item.id}>
                  <span>{item.image}</span>
                  <strong>{item.name}</strong>
                  <small>{item.variant}</small>
                  <small>x{item.quantity}</small>
                  <small>{formatCurrency(item.price)}</small>
                  <b>{formatCurrency(item.total || item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="staff-order-total-box">
              <div>
                <span>Tổng tiền hàng</span>
                <strong>{formatCurrency(detailOrder.subtotal)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển</span>
                <strong>{formatCurrency(detailOrder.shippingFee)}</strong>
              </div>
              <div>
                <span>Tiền giảm</span>
                <strong>-{formatCurrency(detailOrder.discount)}</strong>
              </div>
              <div>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(detailOrder.total)}</strong>
              </div>
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
