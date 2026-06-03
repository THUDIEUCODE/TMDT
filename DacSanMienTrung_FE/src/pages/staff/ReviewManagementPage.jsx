import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockOrders } from '../../data/mockOrders'
import {
  approveReview,
  deleteReview,
  getReviews,
  hideReview,
  mapReviewFromApi,
} from '../../services/reviewService'
import { getImageUrl, handleImageError, isImageValue } from '../../utils/imageUtils'
import './ReviewManagementPage.css'

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
]

const ratingOptions = ['all', '5', '4', '3', '2', '1']
const getImageFallback = (value, fallback = 'SP') => String(value || fallback).slice(0, 2).toUpperCase()

const formatDate = (value) => {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN')
}

const fallbackReviews = mockOrders
  .flatMap((order) =>
    order.items
      .filter((item) => item.rating || item.soSao)
      .map((item) =>
        mapReviewFromApi({
          maChiTietDonHang: item.maChiTietDonHang || item.orderItemId || item.id,
          maDonHang: order.id,
          hoTenNguoiDung: order.customerName || order.receiverName,
          tenSanPham: item.name,
          tenBienThe: item.variant,
          hinhAnh: item.image,
          soSao: item.rating || item.soSao,
          noiDungDanhGia: item.reviewContent || item.noiDungDanhGia,
          ngayDanhGia: item.reviewDate || item.ngayDanhGia || order.orderDate,
          daKiemDuyetDanhGia: item.daKiemDuyetDanhGia ?? item.reviewApproved ?? false,
        }),
      ),
  )

function ReviewManagementPage() {
  const [reviews, setReviews] = useState(fallbackReviews)
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [detailReview, setDetailReview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingActionId, setPendingActionId] = useState('')

  const loadReviews = useCallback(async ({ silent = false, status = statusFilter } = {}) => {
    if (!silent) setIsLoading(true)
    setActionError('')

    try {
      const apiReviews = await getReviews({ status: status === 'all' ? undefined : status })
      setReviews(apiReviews)
      setHasApiError(false)
    } catch (error) {
      setReviews(fallbackReviews)
      setHasApiError(true)
      setActionError(error?.message || '')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadReviews()
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [loadReviews])

  const stats = useMemo(() => {
    return reviews.reduce(
      (result, review) => {
        result.total += 1
        if (review.status === 'pending') result.pending += 1
        if (review.status === 'approved') result.approved += 1
        if (review.rating === 5) result.fiveStars += 1
        if (review.rating <= 2) result.lowStars += 1
        return result
      },
      { total: 0, pending: 0, approved: 0, fiveStars: 0, lowStars: 0 },
    )
  }, [reviews])

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    return reviews.filter((review) => {
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter
      const matchesRating = ratingFilter === 'all' || review.rating === Number(ratingFilter)
      const searchable = [review.customerName, review.productName, review.content, review.variant]
        .join(' ')
        .toLowerCase()
      const matchesKeyword = !keyword || searchable.includes(keyword)

      return matchesStatus && matchesRating && matchesKeyword
    })
  }, [ratingFilter, reviews, searchTerm, statusFilter])

  const changeStatusFilter = (status) => {
    setStatusFilter(status)
    loadReviews({ status, silent: true })
  }

  const runReviewAction = async (review, action) => {
    setActionError('')
    setActionMessage('')

    if (action === 'delete' && !window.confirm('Xóa đánh giá này?')) {
      return
    }

    try {
      setPendingActionId(`${action}-${review.id}`)

      if (action === 'approve') {
        await approveReview(review.id)
        setActionMessage('Đã duyệt đánh giá.')
      }

      if (action === 'hide') {
        await hideReview(review.id)
        setActionMessage('Đã ẩn đánh giá.')
      }

      if (action === 'delete') {
        await deleteReview(review.id)
        setActionMessage('Đã xóa đánh giá.')
        setDetailReview(null)
      }

      await loadReviews({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể cập nhật đánh giá.')
    } finally {
      setPendingActionId('')
    }
  }

  return (
    <div className="review-management-page">
      <section className="review-management-header">
        <span>Đánh giá</span>
        <h1>Quản lý đánh giá sản phẩm</h1>
        <p>Duyệt, ẩn hoặc xóa đánh giá khách hàng gửi sau khi đơn hàng hoàn tất.</p>
      </section>

      <section className="review-stat-grid">
        <article><span>Tổng đánh giá</span><strong>{stats.total}</strong></article>
        <article><span>Chờ duyệt</span><strong>{stats.pending}</strong></article>
        <article><span>Đã duyệt</span><strong>{stats.approved}</strong></article>
        <article><span>5 sao</span><strong>{stats.fiveStars}</strong></article>
        <article><span>1-2 sao</span><strong>{stats.lowStars}</strong></article>
      </section>

      {isLoading ? <p className="review-message">Đang tải đánh giá...</p> : null}
      {hasApiError ? <p className="review-message">Không kết nối được backend, đang dùng dữ liệu mẫu nếu có.</p> : null}
      {actionMessage ? <p className="review-success">{actionMessage}</p> : null}
      {actionError && !hasApiError ? <p className="review-error">{actionError}</p> : null}

      <section className="review-filter-panel">
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => changeStatusFilter(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Số sao
          <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
            {ratingOptions.map((rating) => (
              <option key={rating} value={rating}>{rating === 'all' ? 'Tất cả' : `${rating} sao`}</option>
            ))}
          </select>
        </label>
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Khách hàng, sản phẩm, nội dung"
          />
        </label>
      </section>

      <section className="review-table-card">
        <div className="review-table-summary">
          <strong>{filteredReviews.length} đánh giá</strong>
          <span>Dữ liệu được tải từ backend khi kết nối thành công.</span>
        </div>

        <div className="review-table">
          <div className="review-table-head">
            <span>Ảnh</span>
            <span>Khách hàng</span>
            <span>Sản phẩm</span>
            <span>Biến thể</span>
            <span>Sao</span>
            <span>Nội dung</span>
            <span>Ngày</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredReviews.map((review) => (
            <article className="review-table-row" key={review.id}>
              <span className="review-product-image">
                {isImageValue(review.productImage) ? (
                  <img src={getImageUrl(review.productImage)} alt={review.productName} onError={handleImageError} />
                ) : (
                  getImageFallback(review.productImage, review.productName)
                )}
              </span>
              <strong>{review.customerName}</strong>
              <span>{review.productName}</span>
              <span>{review.variant}</span>
              <b>{'★'.repeat(review.rating)}</b>
              <p>{review.content || 'Không có nội dung'}</p>
              <span>{formatDate(review.reviewDate)}</span>
              <span className={`review-status review-status-${review.status}`}>
                {review.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
              </span>
              <div className="review-actions">
                {review.status === 'pending' ? (
                  <button
                    type="button"
                    disabled={pendingActionId === `approve-${review.id}`}
                    onClick={() => runReviewAction(review, 'approve')}
                  >
                    Duyệt
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pendingActionId === `hide-${review.id}`}
                    onClick={() => runReviewAction(review, 'hide')}
                  >
                    Ẩn
                  </button>
                )}
                <button type="button" onClick={() => setDetailReview(review)}>Xem chi tiết</button>
                <button
                  type="button"
                  disabled={pendingActionId === `delete-${review.id}`}
                  onClick={() => runReviewAction(review, 'delete')}
                >
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredReviews.length === 0 && !isLoading ? (
          <section className="empty-products">
            <h2>Chưa có đánh giá phù hợp</h2>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </section>
        ) : null}
      </section>

      {detailReview ? (
        <div className="review-modal-backdrop" role="presentation">
          <section className="review-modal">
            <div className="review-modal-heading">
              <span>Chi tiết đánh giá</span>
              <h2>{detailReview.productName}</h2>
              <p>{detailReview.customerName}</p>
            </div>
            <div className="review-detail-grid">
              <p><span>Mã chi tiết đơn</span><strong>{detailReview.id}</strong></p>
              <p><span>Mã đơn</span><strong>{detailReview.orderId || 'Đang cập nhật'}</strong></p>
              <p><span>Biến thể</span><strong>{detailReview.variant}</strong></p>
              <p><span>Số sao</span><strong>{'★'.repeat(detailReview.rating)}</strong></p>
              <p><span>Ngày đánh giá</span><strong>{formatDate(detailReview.reviewDate)}</strong></p>
              <p><span>Trạng thái</span><strong>{detailReview.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}</strong></p>
              <p className="review-detail-content"><span>Nội dung</span><strong>{detailReview.content}</strong></p>
            </div>
            <div className="review-modal-actions">
              <button type="button" onClick={() => setDetailReview(null)}>Đóng</button>
              {detailReview.status === 'pending' ? (
                <button className="button" type="button" onClick={() => runReviewAction(detailReview, 'approve')}>Duyệt</button>
              ) : (
                <button className="button" type="button" onClick={() => runReviewAction(detailReview, 'hide')}>Ẩn</button>
              )}
              <button type="button" onClick={() => runReviewAction(detailReview, 'delete')}>Xóa</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ReviewManagementPage
