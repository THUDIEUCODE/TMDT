import { useMemo, useState } from 'react'
import {
  getReturnTotal,
  mockReturns,
  returnReasonLabels,
  returnStatusLabels,
} from '../../data/mockReturns'
import './ReturnManagementPage.css'

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')}đ`

function ReturnManagementPage() {
  const [returns, setReturns] = useState(mockReturns)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [detailReturn, setDetailReturn] = useState(null)
  const [rejectReturn, setRejectReturn] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const stats = useMemo(() => {
    return returns.reduce(
      (result, item) => {
        result.total += 1
        result[item.status] += 1
        return result
      },
      { total: 0, pending: 0, approved: 0, refunded: 0, rejected: 0 },
    )
  }, [returns])

  const filteredReturns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return returns.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.id.toLowerCase().includes(normalizedSearch) ||
        item.orderId.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesReason = reasonFilter === 'all' || item.reason === reasonFilter

      return matchesSearch && matchesStatus && matchesReason
    })
  }, [reasonFilter, returns, searchTerm, statusFilter])

  const approveReturn = (returnId) => {
    const confirmed = window.confirm('Duyệt yêu cầu hoàn hàng này?')
    if (!confirmed) {
      return
    }

    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === returnId
          ? { ...item, status: 'approved', handlingNote: 'Nhân viên đã duyệt yêu cầu hoàn hàng.' }
          : item,
      ),
    )
  }

  const refundReturn = (returnId) => {
    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === returnId
          ? { ...item, status: 'refunded', handlingNote: 'Đã xác nhận hoàn tiền cho khách hàng.' }
          : item,
      ),
    )
  }

  const openRejectModal = (item) => {
    setRejectReturn(item)
    setRejectReason('')
    setRejectError('')
  }

  const submitRejectReturn = (event) => {
    event.preventDefault()

    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối.')
      return
    }

    setReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === rejectReturn.id
          ? { ...item, status: 'rejected', handlingNote: rejectReason.trim() }
          : item,
      ),
    )
    setRejectReturn(null)
    setRejectReason('')
    setRejectError('')
  }

  const renderActions = (item) => (
    <div className="return-actions">
      <button type="button" onClick={() => setDetailReturn(item)}>
        Xem chi tiết
      </button>
      {item.status === 'pending' ? (
        <>
          <button type="button" onClick={() => approveReturn(item.id)}>
            Duyệt
          </button>
          <button className="danger" type="button" onClick={() => openRejectModal(item)}>
            Từ chối
          </button>
        </>
      ) : null}
      {item.status === 'approved' ? (
        <button type="button" onClick={() => refundReturn(item.id)}>
          Xác nhận đã hoàn tiền
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
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Đã duyệt</span>
          <strong>{stats.approved}</strong>
        </article>
        <article>
          <span>Đã hoàn tiền</span>
          <strong>{stats.refunded}</strong>
        </article>
        <article>
          <span>Từ chối</span>
          <strong>{stats.rejected}</strong>
        </article>
      </section>

      <section className="return-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập mã yêu cầu hoặc mã đơn hàng"
          />
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(returnStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Lý do hoàn hàng
          <select value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value)}>
            <option value="all">Tất cả</option>
            {Object.entries(returnReasonLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="return-table-card">
        <div className="return-table-summary">
          <strong>{filteredReturns.length} yêu cầu</strong>
          <span>Dữ liệu mock, thao tác cập nhật bằng state nội bộ.</span>
        </div>

        <div className="return-table">
          <div className="return-table-head">
            <span>Mã yêu cầu</span>
            <span>Mã đơn hàng</span>
            <span>Khách hàng</span>
            <span>Ngày gửi</span>
            <span>Lý do</span>
            <span>Tiền hoàn dự kiến</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredReturns.map((item) => (
            <article className="return-table-row" key={item.id}>
              <strong>{item.id}</strong>
              <span>{item.orderId}</span>
              <span>{item.customerName}</span>
              <span>{item.requestDate}</span>
              <span>{returnReasonLabels[item.reason]}</span>
              <b>{formatCurrency(getReturnTotal(item))}</b>
              <span className={`return-status return-status-${item.status}`}>
                {returnStatusLabels[item.status]}
              </span>
              {renderActions(item)}
            </article>
          ))}
        </div>
      </section>

      {rejectReturn ? (
        <div className="return-modal-backdrop" role="presentation">
          <form className="return-modal" onSubmit={submitRejectReturn}>
            <div className="return-modal-heading">
              <span>Từ chối hoàn hàng</span>
              <h2>{rejectReturn.id}</h2>
              <p>Đơn hàng {rejectReturn.orderId}</p>
            </div>
            <label>
              Lý do từ chối
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value)
                  setRejectError('')
                }}
                placeholder="Nhập lý do từ chối yêu cầu hoàn hàng"
              />
            </label>
            {rejectError ? <p className="return-form-error">{rejectError}</p> : null}
            <div className="return-modal-actions">
              <button type="button" onClick={() => setRejectReturn(null)}>
                Đóng
              </button>
              <button className="button" type="submit">
                Xác nhận từ chối
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
              <h2>{detailReturn.id}</h2>
            </div>

            <div className="return-detail-grid">
              <div>
                <span>Mã đơn hàng</span>
                <strong>{detailReturn.orderId}</strong>
              </div>
              <div>
                <span>Khách hàng</span>
                <strong>{detailReturn.customerName}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{detailReturn.phone}</strong>
              </div>
              <div>
                <span>Ngày yêu cầu</span>
                <strong>{detailReturn.requestDate}</strong>
              </div>
              <div>
                <span>Lý do hoàn hàng</span>
                <strong>{returnReasonLabels[detailReturn.reason]}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{returnStatusLabels[detailReturn.status]}</strong>
              </div>
              <div className="return-detail-full">
                <span>Mô tả chi tiết</span>
                <strong>{detailReturn.description}</strong>
              </div>
            </div>

            <div className="return-evidence-list">
              <h3>Ảnh minh chứng</h3>
              {detailReturn.evidence.length > 0 ? (
                <div>
                  {detailReturn.evidence.map((evidence) => (
                    <span key={evidence}>{evidence}</span>
                  ))}
                </div>
              ) : (
                <p>Không có ảnh minh chứng.</p>
              )}
            </div>

            <div className="return-item-list">
              <h3>Sản phẩm yêu cầu hoàn</h3>
              {detailReturn.items.map((item) => (
                <div className="return-item-row" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.variant}</span>
                  <span>x{item.quantity}</span>
                  <span>{formatCurrency(item.price)}</span>
                  <b>{formatCurrency(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>

            <div className="return-total-box">
              <span>Tổng tiền hoàn</span>
              <strong>{formatCurrency(getReturnTotal(detailReturn))}</strong>
            </div>

            {detailReturn.handlingNote ? (
              <div className="return-handling-note">
                <strong>Ghi chú xử lý</strong>
                <p>{detailReturn.handlingNote}</p>
              </div>
            ) : null}

            <div className="return-modal-actions">
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
