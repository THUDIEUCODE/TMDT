import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockReturns } from '../../data/mockReturns'
import {
  approveReturn,
  getReturnByOrderId,
  getReturns,
  mapReturnFromApi,
  refundReturn,
  rejectReturn,
  returnStatusLabels,
  returnStatusOptions,
} from '../../services/returnService'
import { getCurrentUser } from '../../utils/authStorage'
import { getImageUrl, handleImageError, isImageValue } from '../../utils/imageUtils'
import './ReturnManagementPage.css'

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`
const getImageFallback = (value, fallback = 'SP') => String(value || fallback).slice(0, 2).toUpperCase()
const formatDate = (value) => {
  if (!value) {
    return 'Đang cập nhật'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const fallbackReturns = mockReturns.map(mapReturnFromApi)

const actionConfig = {
  approve: {
    title: 'Duyệt hoàn hàng',
    label: 'Duyệt',
    success: 'Đã duyệt yêu cầu hoàn hàng.',
    placeholder: 'Yêu cầu hợp lệ, đã kiểm tra minh chứng',
    validateNote: false,
  },
  reject: {
    title: 'Từ chối hoàn hàng',
    label: 'Xác nhận từ chối',
    success: 'Đã từ chối yêu cầu hoàn hàng.',
    placeholder: 'Nhập lý do từ chối yêu cầu hoàn hàng',
    validateNote: true,
  },
  refund: {
    title: 'Xác nhận hoàn tiền',
    label: 'Xác nhận hoàn tiền',
    success: 'Đã xác nhận hoàn tiền cho khách hàng.',
    placeholder: 'Đã hoàn tiền theo giao dịch ngân hàng/ví',
    validateNote: false,
  },
}

function ReturnManagementPage() {
  const [returns, setReturns] = useState(fallbackReturns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailReturn, setDetailReturn] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [actionNote, setActionNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [pendingActionId, setPendingActionId] = useState('')
  const [hasApiError, setHasApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const loadReturns = useCallback(async ({ silent = false, status = statusFilter } = {}) => {
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const apiReturns = await getReturns({
        status: status === 'all' ? undefined : status,
      })
      setReturns(apiReturns)
      setHasApiError(false)
    } catch {
      setReturns(fallbackReturns)
      setHasApiError(true)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadReturns()
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
    }
  }, [loadReturns])

  const stats = useMemo(() => {
    return returns.reduce(
      (result, item) => {
        result.total += 1
        result[item.returnStatus] = (result[item.returnStatus] || 0) + 1
        return result
      },
      { total: 0, choDuyet: 0, daDuyet: 0, tuChoi: 0, daHoanTien: 0 },
    )
  }, [returns])

  const filteredReturns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return returns.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.orderId.toLowerCase().includes(normalizedSearch) ||
        item.customerName.toLowerCase().includes(normalizedSearch) ||
        item.phone.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || item.returnStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [returns, searchTerm, statusFilter])

  const changeStatusFilter = (status) => {
    setStatusFilter(status)

    if (!hasApiError) {
      loadReturns({ status })
    }
  }

  const openDetailModal = async (item) => {
    setActionError('')
    setActionMessage('')
    setDetailReturn(item)
    setIsDetailLoading(true)

    try {
      const apiReturn = await getReturnByOrderId(item.orderId)
      setDetailReturn(apiReturn)
    } catch (error) {
      setDetailReturn(item)
      setActionError(error?.message || 'Không thể tải chi tiết yêu cầu hoàn hàng.')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const openActionModal = (type, item) => {
    setDetailReturn(null)
    setActionTarget({ type, item })
    setActionNote('')
    setActionError('')
    setActionMessage('')
  }

  const closeActionModal = () => {
    setActionTarget(null)
    setActionNote('')
  }

  const getStaffId = () => {
    const currentUser = getCurrentUser()
    return currentUser?.maNguoiDung || currentUser?.id || 3
  }

  const submitReturnAction = async (event) => {
    event.preventDefault()

    if (!actionTarget) {
      return
    }

    const config = actionConfig[actionTarget.type]
    const trimmedNote = actionNote.trim()

    setActionError('')
    setActionMessage('')

    if (config.validateNote && !trimmedNote) {
      setActionError('Vui lòng nhập ghi chú xử lý.')
      return
    }

    const payload = {
      maNhanVienXuLy: getStaffId(),
      ghiChuXuLy: trimmedNote,
    }
    const handlers = {
      approve: approveReturn,
      reject: rejectReturn,
      refund: refundReturn,
    }

    try {
      setPendingActionId(actionTarget.item.orderId)
      const updatedReturn = await handlers[actionTarget.type](actionTarget.item.orderId, payload)
      closeActionModal()
      setActionMessage(config.success)

      if (detailReturn && String(detailReturn.orderId) === String(updatedReturn.orderId)) {
        setDetailReturn(updatedReturn)
      }

      await loadReturns({ silent: true })
    } catch (error) {
      setActionError(error?.message || 'Không thể xử lý yêu cầu hoàn hàng.')
    } finally {
      setPendingActionId('')
    }
  }

  const renderActions = (item) => (
    <div className="return-actions">
      <button type="button" onClick={() => openDetailModal(item)}>
        Xem chi tiết
      </button>
      {item.returnStatus === 'choDuyet' ? (
        <>
          <button type="button" disabled={pendingActionId === item.orderId} onClick={() => openActionModal('approve', item)}>
            Duyệt
          </button>
          <button
            className="danger"
            type="button"
            disabled={pendingActionId === item.orderId}
            onClick={() => openActionModal('reject', item)}
          >
            Từ chối
          </button>
        </>
      ) : null}
      {item.returnStatus === 'daDuyet' ? (
        <button type="button" disabled={pendingActionId === item.orderId} onClick={() => openActionModal('refund', item)}>
          Xác nhận hoàn tiền
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="return-management-page">
      <section className="return-management-header">
        <div>
          <span>Khu vực nhân viên</span>
          <h1>Xử lý hoàn hàng</h1>
          <p>Kiểm tra yêu cầu hoàn hàng, duyệt xử lý và xác nhận hoàn tiền cho khách.</p>
        </div>
      </section>

      <section className="return-stat-grid">
        <article>
          <span>Tổng yêu cầu hoàn hàng</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Chờ duyệt</span>
          <strong>{stats.choDuyet}</strong>
        </article>
        <article>
          <span>Đã duyệt</span>
          <strong>{stats.daDuyet}</strong>
        </article>
        <article>
          <span>Từ chối</span>
          <strong>{stats.tuChoi}</strong>
        </article>
        <article>
          <span>Đã hoàn tiền</span>
          <strong>{stats.daHoanTien}</strong>
        </article>
      </section>

      {isLoading ? <p className="return-message">Đang tải yêu cầu hoàn hàng...</p> : null}
      {hasApiError ? (
        <p className="return-message">Không kết nối được backend, đang dùng dữ liệu mẫu.</p>
      ) : null}
      {actionMessage ? <p className="return-success">{actionMessage}</p> : null}
      {actionError ? <p className="return-form-error">{actionError}</p> : null}

      <section className="return-filter-panel">
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
          <select value={statusFilter} onChange={(event) => changeStatusFilter(event.target.value)}>
            {returnStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="return-table-card">
        <div className="return-table-summary">
          <strong>{filteredReturns.length} yêu cầu</strong>
          <span>Dữ liệu được tải từ backend khi kết nối thành công.</span>
        </div>

        <div className="return-table">
          <div className="return-table-head">
            <span>Mã đơn hàng</span>
            <span>Khách hàng</span>
            <span>Số điện thoại</span>
            <span>Ngày đặt</span>
            <span>Lý do hoàn hàng</span>
            <span>Tiền hoàn dự kiến</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredReturns.map((item) => (
            <article className="return-table-row" key={item.orderId}>
              <strong>{item.orderId}</strong>
              <span>{item.customerName || 'Đang cập nhật'}</span>
              <span>{item.phone || 'Đang cập nhật'}</span>
              <span>{formatDate(item.orderDate)}</span>
              <span>{item.returnReason || 'Không có'}</span>
              <b>{formatCurrency(item.estimatedRefund)}</b>
              <span className={`return-status return-status-${item.returnStatus}`}>
                {returnStatusLabels[item.returnStatus] || item.returnStatus}
              </span>
              {renderActions(item)}
            </article>
          ))}

          {filteredReturns.length === 0 && !isLoading ? (
            <section className="empty-products">
              <h2>Chưa có yêu cầu hoàn hàng phù hợp</h2>
              <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
            </section>
          ) : null}
        </div>
      </section>

      {actionTarget ? (
        <div className="return-modal-backdrop" role="presentation">
          <form className="return-modal" onSubmit={submitReturnAction}>
            <div className="return-modal-heading">
              <span>{actionConfig[actionTarget.type].title}</span>
              <h2>{actionTarget.item.orderId}</h2>
              <p>{actionTarget.item.customerName}</p>
            </div>
            <label>
              Ghi chú xử lý
              <textarea
                rows="4"
                value={actionNote}
                onChange={(event) => {
                  setActionNote(event.target.value)
                  setActionError('')
                }}
                placeholder={actionConfig[actionTarget.type].placeholder}
              />
            </label>
            {actionError ? <p className="return-form-error">{actionError}</p> : null}
            <div className="return-modal-actions">
              <button type="button" onClick={closeActionModal}>
                Đóng
              </button>
              <button className="button" type="submit" disabled={pendingActionId === actionTarget.item.orderId}>
                {actionConfig[actionTarget.type].label}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detailReturn ? (
        <div className="return-modal-backdrop" role="presentation">
          <section className="return-modal return-detail-modal">
            <div className="return-modal-heading">
              <span>Chi tiết hoàn hàng</span>
              <h2>{detailReturn.orderId}</h2>
            </div>

            {isDetailLoading ? <p className="return-message">Đang tải chi tiết yêu cầu hoàn hàng...</p> : null}

            <div className="return-detail-grid">
              <div>
                <span>Mã đơn hàng</span>
                <strong>{detailReturn.orderId}</strong>
              </div>
              <div>
                <span>Khách hàng</span>
                <strong>{detailReturn.customerName || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailReturn.phone || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Địa chỉ giao hàng</span>
                <strong>{detailReturn.address || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Ngày đặt</span>
                <strong>{formatDate(detailReturn.orderDate)}</strong>
              </div>
              <div>
                <span>Tổng thanh toán</span>
                <strong>{formatCurrency(detailReturn.orderTotal)}</strong>
              </div>
              <div>
                <span>Trạng thái đơn hàng</span>
                <strong>{detailReturn.orderStatus || 'Đang cập nhật'}</strong>
              </div>
              <div>
                <span>Trạng thái hoàn hàng</span>
                <strong>{returnStatusLabels[detailReturn.returnStatus] || detailReturn.returnStatus}</strong>
              </div>
              <div className="return-detail-full">
                <span>Lý do hoàn hàng</span>
                <strong>{detailReturn.returnReason || 'Không có'}</strong>
              </div>
              {detailReturn.staffId ? (
                <div>
                  <span>Nhân viên xử lý</span>
                  <strong>{detailReturn.staffId}</strong>
                </div>
              ) : null}
              {detailReturn.staffNote ? (
                <div className="return-detail-full">
                  <span>Ghi chú xử lý</span>
                  <strong>{detailReturn.staffNote}</strong>
                </div>
              ) : null}
            </div>

            <div className="return-evidence-list">
              <h3>Ảnh minh chứng</h3>
              {detailReturn.proofImage ? (
                <div>
                  <span>
                    {isImageValue(detailReturn.proofImage) ? (
                      <img src={getImageUrl(detailReturn.proofImage)} alt="Ảnh minh chứng" onError={handleImageError} />
                    ) : (
                      detailReturn.proofImage
                    )}
                  </span>
                </div>
              ) : (
                <p>Không có ảnh minh chứng.</p>
              )}
            </div>

            <div className="return-item-list">
              <h3>Sản phẩm yêu cầu hoàn</h3>
              {(detailReturn.items || []).map((item) => (
                <div className="return-item-row" key={item.id}>
                  <span className="return-item-image">
                    {isImageValue(item.image) ? (
                      <img src={getImageUrl(item.image)} alt={item.name} onError={handleImageError} />
                    ) : (
                      getImageFallback(item.image, item.name)
                    )}
                  </span>
                  <strong>{item.name}</strong>
                  <span>{item.variant}</span>
                  <span>Mua: {item.quantity}</span>
                  <span>Hoàn: {item.returnQuantity}</span>
                  <span>{formatCurrency(item.refundPrice)}</span>
                  <b>{formatCurrency(item.refundTotal)}</b>
                </div>
              ))}
            </div>

            <div className="return-total-box">
              <span>Tổng tiền hoàn dự kiến</span>
              <strong>{formatCurrency(detailReturn.estimatedRefund)}</strong>
            </div>

            <div className="return-modal-actions">
              {detailReturn.returnStatus === 'choDuyet' ? (
                <>
                  <button type="button" onClick={() => openActionModal('approve', detailReturn)}>
                    Duyệt
                  </button>
                  <button type="button" onClick={() => openActionModal('reject', detailReturn)}>
                    Từ chối
                  </button>
                </>
              ) : null}
              {detailReturn.returnStatus === 'daDuyet' ? (
                <button type="button" onClick={() => openActionModal('refund', detailReturn)}>
                  Xác nhận hoàn tiền
                </button>
              ) : null}
              <button type="button" onClick={() => setDetailReturn(null)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ReturnManagementPage
