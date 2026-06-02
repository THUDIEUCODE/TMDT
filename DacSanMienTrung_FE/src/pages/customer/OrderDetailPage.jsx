import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { mockOrders } from '../../data/mockOrders'
import {
  cancelOrder,
  confirmReceived,
  confirmWalletPayment,
  getOrderById,
  normalizeOrderStatus,
  orderStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from '../../services/orderService'
import { createReturnRequest } from '../../services/returnService'
import { createReview } from '../../services/reviewService'
import { getCurrentUserId } from '../../utils/authStorage'
import '../../components/order/OrderStatusBadge.css'
import './OrderDetailPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const formatDate = (value) => {
  if (!value) {
    return 'Đang cập nhật'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
}

const normalizeMockOrder = (order) => ({
  ...order,
  status: normalizeOrderStatus(order.status),
  paymentStatus: order.paymentStatus || '',
  paymentMethod: order.paymentMethod || 'COD',
  transactionCode: order.transactionCode || '',
  paidAt: order.paidAt || '',
  district: order.district || '',
  province: order.province || '',
  returnStatus: order.returnStatus || 'khongCo',
  subtotal: order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  total: order.total ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.shippingFee - order.discount,
  items: order.items.map((item) => ({
    ...item,
    orderItemId: item.maChiTietDonHang || item.orderItemId || item.id,
    maChiTietDonHang: item.maChiTietDonHang || item.orderItemId || item.id,
    total: item.total ?? item.price * item.quantity,
    rating: item.rating ?? item.soSao ?? null,
    reviewContent: item.reviewContent ?? item.noiDungDanhGia ?? '',
  })),
})
const fallbackOrders = mockOrders.map(normalizeMockOrder)

function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fallbackOrder = useMemo(() => fallbackOrders.find((item) => String(item.id) === String(id)), [id])
  const [order, setOrder] = useState(fallbackOrder)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnImage, setReturnImage] = useState('')
  const [returnItems, setReturnItems] = useState({})
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' })

  const loadOrder = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiOrder = await getOrderById(id)
      setOrder(apiOrder)
      setHasApiError(false)
    } catch {
      setOrder(fallbackOrder)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [fallbackOrder, id])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadOrder()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [id, loadOrder])

  const canCancel = order?.status === 'choXacNhan'
  const canReturn = order?.status === 'daGiao' && (order?.returnStatus === 'khongCo' || !order?.returnStatus)
  const canReview = order?.status === 'daGiao'
  const canConfirmReceived = order?.status === 'dangGiao'
  const canConfirmWallet = order?.paymentMethod === 'vi' && order?.paymentStatus === 'choThanhToan'
  const shouldShowBankTransferGuide = order?.paymentMethod === 'chuyenKhoan' && order?.paymentStatus === 'choThanhToan'

  const submitConfirmReceived = async () => {
    if (!window.confirm('Xác nhận bạn đã nhận được hàng?')) {
      return
    }

    setActionError('')
    setActionMessage('')

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`)
        return
      }

      await confirmReceived(id, { maNguoiDung })
      setActionMessage('Đã xác nhận nhận hàng.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể xác nhận nhận hàng.')
    }
  }

  const submitConfirmWalletPayment = async () => {
    setActionError('')
    setActionMessage('')

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`)
        return
      }

      await confirmWalletPayment(id, {
        maNguoiDung,
        maGiaoDich: `VI-DEMO-DH${id}`,
      })
      setActionMessage('Đã xác nhận thanh toán ví.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể xác nhận thanh toán ví.')
    }
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
      await cancelOrder(id, { lyDoHuy: cancelReason.trim() })
      setCancelModalOpen(false)
      setCancelReason('')
      setActionMessage('Đã gửi yêu cầu hủy đơn hàng.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể hủy đơn hàng.')
    }
  }

  const toggleReturnItem = (item, checked) => {
    setReturnItems((current) => {
      const nextItems = { ...current }

      if (checked) {
        nextItems[item.orderItemId] = {
          maChiTietDonHang: item.maChiTietDonHang,
          soLuongHoan: 1,
          maxQuantity: item.quantity,
        }
      } else {
        delete nextItems[item.orderItemId]
      }

      return nextItems
    })
  }

  const updateReturnQuantity = (item, quantity) => {
    const nextQuantity = Number(quantity)

    if (!Number.isFinite(nextQuantity)) {
      return
    }

    setReturnItems((current) => ({
      ...current,
      [item.orderItemId]: {
        ...(current[item.orderItemId] || {
          maChiTietDonHang: item.maChiTietDonHang,
          maxQuantity: item.quantity,
        }),
        soLuongHoan: Math.min(Math.max(nextQuantity, 1), item.quantity),
      },
    }))
  }

  const submitReturnRequest = async (event) => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')

    const selectedItems = Object.values(returnItems)

    if (!returnReason.trim()) {
      setActionError('Vui lòng nhập lý do hoàn hàng.')
      return
    }

    if (selectedItems.length === 0) {
      setActionError('Vui lòng chọn ít nhất 1 sản phẩm để hoàn.')
      return
    }

    if (selectedItems.some((item) => item.soLuongHoan <= 0 || item.soLuongHoan > item.maxQuantity)) {
      setActionError('Số lượng hoàn phải lớn hơn 0 và không vượt quá số lượng mua.')
      return
    }

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`)
        return
      }

      await createReturnRequest({
        maNguoiDung,
        maDonHang: id,
        lyDoHoanHang: returnReason.trim(),
        hinhAnhMinhChung: returnImage.trim(),
        items: selectedItems.map(({ maChiTietDonHang, soLuongHoan }) => ({
          maChiTietDonHang,
          soLuongHoan,
        })),
      })
      setReturnModalOpen(false)
      setReturnReason('')
      setReturnImage('')
      setReturnItems({})
      setActionMessage('Đã gửi yêu cầu hoàn hàng.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể gửi yêu cầu hoàn hàng.')
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setActionError('')
    setActionMessage('')

    const rating = Number(reviewForm.rating)

    if (!rating || rating < 1 || rating > 5) {
      setActionError('Số sao phải từ 1 đến 5.')
      return
    }

    if (!reviewForm.content.trim()) {
      setActionError('Vui lòng nhập nội dung đánh giá.')
      return
    }

    try {
      const maNguoiDung = getCurrentUserId()

      if (!maNguoiDung) {
        navigate(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`)
        return
      }

      await createReview({
        maNguoiDung,
        maChiTietDonHang: reviewItem.maChiTietDonHang,
        soSao: rating,
        noiDungDanhGia: reviewForm.content.trim(),
      })
      setReviewItem(null)
      setReviewForm({ rating: 5, content: '' })
      setActionMessage('Đã gửi đánh giá sản phẩm.')
      await loadOrder({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể gửi đánh giá.')
    }
  }

  if (!order && !isLoading) {
    return (
      <section className="order-detail-empty">
        <h1>Không tìm thấy đơn hàng</h1>
        <p>Đơn hàng không tồn tại hoặc chưa thể tải từ backend.</p>
        <Link className="button" to="/profile">
          Quay lại tài khoản
        </Link>
      </section>
    )
  }

  return (
    <div className="order-detail-page">
      {isLoading ? <p className="product-result-summary">Đang tải chi tiết đơn hàng...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu nếu có.
        </p>
      ) : null}
      {actionError ? <p className="form-error">{actionError}</p> : null}
      {actionMessage ? <p className="form-success">{actionMessage}</p> : null}

      {order ? (
        <>
          <section className="order-detail-hero">
            <div>
              <span>Chi tiết đơn hàng</span>
              <h1>{order.code || order.id}</h1>
              <p>Ngày đặt: {formatDate(order.orderDate)}</p>
            </div>
            <span className={`status-badge status-${order.status}`}>
              {orderStatusLabels[order.status] || order.status}
            </span>
          </section>

          <section className="order-detail-grid">
            <article className="order-detail-card">
              <h2>Người nhận</h2>
              <div className="detail-lines">
                <p>
                  <span>Họ tên</span>
                  <strong>{order.receiverName || 'Đang cập nhật'}</strong>
                </p>
                <p>
                  <span>Số điện thoại</span>
                  <strong>{order.receiverPhone || 'Đang cập nhật'}</strong>
                </p>
                <p>
                  <span>Địa chỉ giao hàng</span>
                  <strong>{order.shippingAddress || 'Đang cập nhật'}</strong>
                </p>
                <p>
                  <span>Quận/huyện</span>
                  <strong>{order.district || 'Đang cập nhật'}</strong>
                </p>
                <p>
                  <span>Tỉnh/thành</span>
                  <strong>{order.province || 'Đang cập nhật'}</strong>
                </p>
                <p>
                  <span>Phương thức thanh toán</span>
                  <strong>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</strong>
                </p>
                <p>
                  <span>Trạng thái thanh toán</span>
                  <strong>{paymentStatusLabels[order.paymentStatus] || order.paymentStatus || 'Đang cập nhật'}</strong>
                </p>
                {order.transactionCode ? (
                  <p>
                    <span>Mã giao dịch</span>
                    <strong>{order.transactionCode}</strong>
                  </p>
                ) : null}
                {order.paidAt ? (
                  <p>
                    <span>Ngày thanh toán</span>
                    <strong>{formatDate(order.paidAt)}</strong>
                  </p>
                ) : null}
                <p>
                  <span>Ghi chú giao hàng</span>
                  <strong>{order.note || 'Không có'}</strong>
                </p>
                {order.cancelReason ? (
                  <p>
                    <span>Lý do hủy</span>
                    <strong>{order.cancelReason}</strong>
                  </p>
                ) : null}
                {order.returnReason ? (
                  <p>
                    <span>Lý do hoàn hàng</span>
                    <strong>{order.returnReason}</strong>
                  </p>
                ) : null}
                {order.returnStatus && order.returnStatus !== 'khongCo' ? (
                  <p>
                    <span>Trạng thái hoàn hàng</span>
                    <strong>{order.returnStatus}</strong>
                  </p>
                ) : null}
              </div>
            </article>

            <article className="order-detail-card">
              <h2>Thông tin đơn hàng</h2>
              <div className="detail-lines">
                <p>
                  <span>Mã đơn hàng</span>
                  <strong>{order.code || order.id}</strong>
                </p>
                <p>
                  <span>Trạng thái đơn hàng</span>
                  <strong>{orderStatusLabels[order.status] || order.status}</strong>
                </p>
                <p>
                  <span>Số sản phẩm</span>
                  <strong>{order.items.length}</strong>
                </p>
              </div>
            </article>
          </section>

          {shouldShowBankTransferGuide ? (
            <section className="order-detail-card payment-note">
              <h2>Hướng dẫn chuyển khoản</h2>
              <p>Ngân hàng: Demo Bank</p>
              <p>Chủ tài khoản: DAC SAN MIEN TRUNG</p>
              <p>Số tài khoản: 0123456789</p>
              <p>Số tiền: {formatCurrency(order.total)}</p>
              <p>Nội dung chuyển khoản: DH{order.code || order.id} - {order.receiverPhone}</p>
              <p>Sau khi bạn chuyển khoản, nhân viên sẽ kiểm tra và xác nhận thanh toán trên hệ thống.</p>
            </section>
          ) : null}

          <section className="order-detail-card">
            <h2>Sản phẩm trong đơn</h2>
            <div className="order-items-table">
              <div className="order-items-head">
                <span>Sản phẩm</span>
                <span>Quy cách</span>
                <span>Số lượng</span>
                <span>Đơn giá</span>
                <span>Thành tiền</span>
                <span>Đánh giá</span>
              </div>

              {order.items.map((item) => (
                <div className="order-item-row" key={item.id}>
                  <div className="order-item-product">
                    <span>{item.image}</span>
                    <strong>{item.name}</strong>
                  </div>
                  <span>{item.variant}</span>
                  <span>{item.quantity}</span>
                  <span>{formatCurrency(item.price)}</span>
                  <strong>{formatCurrency(item.total || item.price * item.quantity)}</strong>
                  <div className="order-item-actions">
                    {item.rating ? (
                      <p>
                        <strong>{item.rating}/5 sao</strong>
                        <small>{item.reviewContent}</small>
                      </p>
                    ) : canReview ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewItem(item)
                          setReviewForm({ rating: 5, content: '' })
                        }}
                      >
                        Đánh giá
                      </button>
                    ) : (
                      <span>Chưa có</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="order-detail-bottom">
            <div className="order-detail-actions">
              <button className="button secondary" type="button" onClick={() => navigate(-1)}>
                Quay lại
              </button>
              {canCancel ? (
                <button className="button" type="button" onClick={() => setCancelModalOpen(true)}>
                  Hủy đơn
                </button>
              ) : null}
              {canConfirmReceived ? (
                <button className="button" type="button" onClick={submitConfirmReceived}>
                  Đã nhận được hàng
                </button>
              ) : null}
              {canConfirmWallet ? (
                <button className="button" type="button" onClick={submitConfirmWalletPayment}>
                  Xác nhận thanh toán ví demo
                </button>
              ) : null}
              {canReturn ? (
                <button className="button" type="button" onClick={() => setReturnModalOpen(true)}>
                  Yêu cầu hoàn hàng
                </button>
              ) : null}
            </div>

            <aside className="order-total-card">
              <div>
                <span>Tổng tiền hàng</span>
                <strong>{formatCurrency(order.subtotal)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển</span>
                <strong>{formatCurrency(order.shippingFee)}</strong>
              </div>
              <div>
                <span>Giảm giá/voucher</span>
                <strong>-{formatCurrency(order.discount)}</strong>
              </div>
              <div className="order-total-line">
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
            </aside>
          </section>
        </>
      ) : null}

      {cancelModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={submitCancelOrder}>
            <div className="profile-panel-heading">
              <span>Hủy đơn hàng</span>
              <h2>{order.code || order.id}</h2>
            </div>
            <label>
              Lý do hủy
              <input
                required
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Tôi muốn thay đổi địa chỉ giao hàng"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setCancelModalOpen(false)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Xác nhận hủy
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {returnModalOpen ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal order-action-modal" onSubmit={submitReturnRequest}>
            <div className="profile-panel-heading">
              <span>Yêu cầu hoàn hàng</span>
              <h2>{order.code || order.id}</h2>
            </div>
            <label>
              Lý do hoàn hàng
              <textarea
                required
                rows="3"
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                placeholder="Sản phẩm bị hư hỏng khi nhận hàng"
              />
            </label>
            <label>
              Hình ảnh minh chứng
              <input
                value={returnImage}
                onChange={(event) => setReturnImage(event.target.value)}
                placeholder="image-demo.jpg hoặc URL ảnh"
              />
            </label>
            <div className="return-item-list">
              {order.items.map((item) => {
                const selectedItem = returnItems[item.orderItemId]
                return (
                  <label className="return-item-row" key={item.id}>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedItem)}
                      onChange={(event) => toggleReturnItem(item, event.target.checked)}
                    />
                    <span>{item.name}</span>
                    <small>Đã mua: {item.quantity}</small>
                    <input
                      min="1"
                      max={item.quantity}
                      type="number"
                      value={selectedItem?.soLuongHoan || 1}
                      disabled={!selectedItem}
                      onChange={(event) => updateReturnQuantity(item, event.target.value)}
                    />
                  </label>
                )
              })}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setReturnModalOpen(false)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {reviewItem ? (
        <div className="profile-modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={submitReview}>
            <div className="profile-panel-heading">
              <span>Đánh giá sản phẩm</span>
              <h2>{reviewItem.name}</h2>
            </div>
            <label>
              Số sao
              <select
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
              >
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </label>
            <label>
              Nội dung đánh giá
              <textarea
                required
                rows="4"
                value={reviewForm.content}
                onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Sản phẩm ngon, đóng gói đẹp."
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setReviewItem(null)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Gửi đánh giá
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default OrderDetailPage
