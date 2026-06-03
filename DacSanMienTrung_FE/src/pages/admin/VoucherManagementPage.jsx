import { useCallback, useEffect, useMemo, useState } from 'react'
import { mockVouchers } from '../../data/mockVouchers'
import {
  createVoucher,
  deleteVoucher,
  discountTypeLabels,
  getVoucherById,
  getVouchers,
  mapVoucherFromApi,
  toggleVoucher,
  updateVoucher,
  voucherStatusLabels,
} from '../../services/voucherService'
import './VoucherManagementPage.css'

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: voucherStatusLabels.active },
  { value: 'disabled', label: voucherStatusLabels.disabled },
  { value: 'expired', label: voucherStatusLabels.expired },
  { value: 'outOfUses', label: voucherStatusLabels.outOfUses },
]

const discountTypeOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'phanTram', label: discountTypeLabels.phanTram },
  { value: 'soTien', label: discountTypeLabels.soTien },
]

const emptyVoucherForm = {
  maCode: '',
  loaiGiam: 'phanTram',
  giaTriGiam: '',
  donHangToiThieu: '',
  soLuongTon: '',
  ngayBatDau: '',
  ngayHetHan: '',
  trangThai: 'true',
}

const fallbackVouchers = mockVouchers.map(mapVoucherFromApi)

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const formatDiscount = (voucher) => {
  if (voucher.discountType === 'phanTram') {
    return `${Number(voucher.discountValue || 0).toLocaleString('vi-VN')}%`
  }

  return formatCurrency(voucher.discountValue)
}

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

const getVoucherKey = (voucher) => voucher.maVoucher ?? voucher.id

const toDateInputValue = (value) => {
  if (!value) {
    return ''
  }

  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

const filterVouchersLocal = (vouchers, filters) => {
  const keyword = filters.keyword.trim().toLowerCase()

  return vouchers.filter((voucher) => {
    const matchesKeyword = !keyword || voucher.code.toLowerCase().includes(keyword)
    const matchesStatus = filters.status === 'all' || voucher.statusKey === filters.status
    const matchesDiscountType =
      filters.discountType === 'all' || voucher.discountType === filters.discountType

    return matchesKeyword && matchesStatus && matchesDiscountType
  })
}

const buildVoucherPayload = (formData) => ({
  maCode: formData.maCode.trim().toUpperCase(),
  loaiGiam: formData.loaiGiam,
  giaTriGiam: Number(formData.giaTriGiam),
  donHangToiThieu: formData.donHangToiThieu === '' ? 0 : Number(formData.donHangToiThieu),
  soLuongTon: Number(formData.soLuongTon),
  ngayBatDau: formData.ngayBatDau || null,
  ngayHetHan: formData.ngayHetHan,
  trangThai: formData.trangThai === 'true',
})

function VoucherManagementPage() {
  const [vouchers, setVouchers] = useState(fallbackVouchers)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [detailVoucher, setDetailVoucher] = useState(null)
  const [modalMode, setModalMode] = useState(null)
  const [editingVoucherId, setEditingVoucherId] = useState(null)
  const [formData, setFormData] = useState(emptyVoucherForm)

  const filters = useMemo(
    () => ({
      keyword: searchTerm.trim(),
      status: statusFilter,
      discountType: discountTypeFilter,
    }),
    [discountTypeFilter, searchTerm, statusFilter],
  )

  const loadVouchers = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getVouchers({
        keyword: filters.keyword,
      })
      setVouchers(data)
      setErrorMessage('')
    } catch {
      setVouchers(fallbackVouchers)
      setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    let isMounted = true

    const loadInitialVouchers = async () => {
      setIsLoading(true)

      try {
        const data = await getVouchers({
          keyword: filters.keyword,
        })

        if (!isMounted) {
          return
        }

        setVouchers(data)
        setErrorMessage('')
      } catch {
        if (!isMounted) {
          return
        }

        setVouchers(fallbackVouchers)
        setErrorMessage('Không kết nối được backend, đang dùng dữ liệu mẫu.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialVouchers()

    return () => {
      isMounted = false
    }
  }, [filters.keyword])

  const stats = useMemo(() => {
    return vouchers.reduce(
      (result, voucher) => {
        result.total += 1
        result[voucher.statusKey] = (result[voucher.statusKey] || 0) + 1
        return result
      },
      { total: 0, active: 0, disabled: 0, expired: 0, outOfUses: 0 },
    )
  }, [vouchers])

  const filteredVouchers = useMemo(() => filterVouchersLocal(vouchers, filters), [filters, vouchers])

  const openAddModal = () => {
    setActionError('')
    setActionMessage('')
    setModalMode('add')
    setEditingVoucherId(null)
    setFormData(emptyVoucherForm)
  }

  const openEditModal = (voucher) => {
    setActionError('')
    setActionMessage('')
    setModalMode('edit')
    setEditingVoucherId(getVoucherKey(voucher))
    setFormData({
      maCode: voucher.code || '',
      loaiGiam: voucher.discountType || 'phanTram',
      giaTriGiam: String(voucher.discountValue || ''),
      donHangToiThieu: String(voucher.minOrderValue || 0),
      soLuongTon: String(voucher.quantity ?? 0),
      ngayBatDau: toDateInputValue(voucher.startDate),
      ngayHetHan: toDateInputValue(voucher.endDate),
      trangThai: voucher.enabled ? 'true' : 'false',
    })
  }

  const closeFormModal = () => {
    setModalMode(null)
    setEditingVoucherId(null)
    setFormData(emptyVoucherForm)
    setActionError('')
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    const discountValue = Number(formData.giaTriGiam)
    const quantity = Number(formData.soLuongTon)

    if (!formData.maCode.trim()) {
      return 'Mã voucher không được rỗng.'
    }

    if (!formData.loaiGiam) {
      return 'Loại giảm bắt buộc.'
    }

    if (!discountValue || discountValue <= 0) {
      return 'Giá trị giảm phải lớn hơn 0.'
    }

    if (formData.loaiGiam === 'phanTram' && (discountValue < 1 || discountValue > 100)) {
      return 'Giá trị giảm phần trăm phải từ 1 đến 100.'
    }

    if (Number.isNaN(quantity) || quantity < 0) {
      return 'Số lượng phải lớn hơn hoặc bằng 0.'
    }

    if (!formData.ngayHetHan) {
      return 'Ngày hết hạn không được rỗng.'
    }

    if (formData.ngayBatDau && formData.ngayBatDau > formData.ngayHetHan) {
      return 'Ngày bắt đầu không được sau ngày hết hạn.'
    }

    return ''
  }

  const saveVoucher = async (event) => {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setActionError(validationMessage)
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      if (modalMode === 'edit') {
        await updateVoucher(editingVoucherId, buildVoucherPayload(formData))
        setActionMessage('Đã cập nhật voucher.')
      } else {
        await createVoucher(buildVoucherPayload(formData))
        setActionMessage('Đã thêm voucher.')
      }

      closeFormModal()
      await loadVouchers()
    } catch (error) {
      setActionError(error?.message || 'Không thể lưu voucher.')
    } finally {
      setIsSaving(false)
    }
  }

  const openDetailModal = async (voucher) => {
    setActionError('')
    setDetailVoucher(voucher)

    try {
      const data = await getVoucherById(getVoucherKey(voucher))
      setDetailVoucher(data)
    } catch (error) {
      setActionError(error?.message || 'Không tải được chi tiết voucher.')
    }
  }

  const handleToggleVoucher = async (voucher) => {
    const shouldToggle = window.confirm(
      voucher.enabled ? 'Bạn có chắc muốn tắt voucher này?' : 'Bạn có chắc muốn bật voucher này?',
    )

    if (!shouldToggle) {
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      await toggleVoucher(getVoucherKey(voucher))
      setActionMessage(voucher.enabled ? 'Đã tắt voucher.' : 'Đã bật voucher.')
      await loadVouchers()
    } catch (error) {
      setActionError(error?.message || 'Không cập nhật được trạng thái voucher.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteVoucher = async (voucher) => {
    if (!window.confirm('Bạn có chắc muốn xóa mềm voucher này?')) {
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      await deleteVoucher(getVoucherKey(voucher))
      setActionMessage('Đã xóa mềm voucher.')
      await loadVouchers()
    } catch (error) {
      setActionError(error?.message || 'Không xóa được voucher.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="voucher-management-page">
      <section className="voucher-management-header">
        <div>
          <span>Khu vực quản trị</span>
          <h1>Quản lý voucher</h1>
          <p>Theo dõi mã giảm giá, thời hạn, số lượng còn lại và trạng thái áp dụng voucher.</p>
        </div>
        <button className="button" type="button" onClick={openAddModal}>
          Thêm voucher
        </button>
      </section>

      {isLoading ? <div className="voucher-message">Đang tải voucher...</div> : null}
      {errorMessage ? <div className="voucher-message voucher-message-warning">{errorMessage}</div> : null}
      {actionMessage ? <div className="voucher-message voucher-message-success">{actionMessage}</div> : null}
      {actionError ? <div className="voucher-message voucher-message-error">{actionError}</div> : null}

      <section className="voucher-stat-grid">
        <article>
          <span>Tổng voucher</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Đang hoạt động</span>
          <strong>{stats.active}</strong>
        </article>
        <article>
          <span>Đã tắt</span>
          <strong>{stats.disabled}</strong>
        </article>
        <article>
          <span>Hết hạn</span>
          <strong>{stats.expired}</strong>
        </article>
        <article>
          <span>Hết lượt dùng</span>
          <strong>{stats.outOfUses}</strong>
        </article>
      </section>

      <section className="voucher-filter-panel">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nhập mã voucher"
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
          Loại giảm
          <select
            value={discountTypeFilter}
            onChange={(event) => setDiscountTypeFilter(event.target.value)}
          >
            {discountTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="voucher-table-card">
        <div className="voucher-table-summary">
          <strong>{filteredVouchers.length} voucher</strong>
          <span>{errorMessage ? 'Đang hiển thị dữ liệu mẫu.' : 'Dữ liệu đồng bộ từ backend.'}</span>
        </div>

        <div className="voucher-table">
          <div className="voucher-table-head">
            <span>Mã voucher</span>
            <span>Loại giảm</span>
            <span>Giá trị giảm</span>
            <span>Đơn tối thiểu</span>
            <span>Còn lại</span>
            <span>Ngày bắt đầu</span>
            <span>Ngày hết hạn</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {filteredVouchers.length ? (
            filteredVouchers.map((voucher) => (
              <article className="voucher-table-row" key={getVoucherKey(voucher)}>
                <strong>{voucher.code}</strong>
                <span>{voucher.discountTypeLabel}</span>
                <strong className="voucher-value">{formatDiscount(voucher)}</strong>
                <span>{formatCurrency(voucher.minOrderValue)}</span>
                <span>{Number(voucher.quantity || 0).toLocaleString('vi-VN')}</span>
                <span>{formatDate(voucher.startDate)}</span>
                <span>{formatDate(voucher.endDate)}</span>
                <span className={`voucher-status voucher-status-${voucher.statusKey}`}>
                  {voucher.status}
                </span>
                <div className="voucher-actions">
                  <button type="button" disabled={isSaving} onClick={() => openDetailModal(voucher)}>
                    Xem chi tiết
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => openEditModal(voucher)}>
                    Sửa
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => handleToggleVoucher(voucher)}>
                    {voucher.enabled ? 'Tắt' : 'Bật'}
                  </button>
                  <button type="button" disabled={isSaving} onClick={() => handleDeleteVoucher(voucher)}>
                    Xóa
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="voucher-empty-state">Không có voucher phù hợp.</p>
          )}
        </div>
      </section>

      {detailVoucher ? (
        <div className="voucher-modal-backdrop" role="presentation">
          <section className="voucher-modal voucher-detail-modal">
            <div className="voucher-modal-heading">
              <span>Chi tiết voucher</span>
              <h2>{detailVoucher.code}</h2>
            </div>
            <div className="voucher-detail-grid">
              <div>
                <span>Mã nội bộ</span>
                <strong>{getVoucherKey(detailVoucher)}</strong>
              </div>
              <div>
                <span>Mã voucher</span>
                <strong>{detailVoucher.code}</strong>
              </div>
              <div>
                <span>Loại giảm</span>
                <strong>{detailVoucher.discountTypeLabel}</strong>
              </div>
              <div>
                <span>Giá trị giảm</span>
                <strong>{formatDiscount(detailVoucher)}</strong>
              </div>
              <div>
                <span>Đơn hàng tối thiểu</span>
                <strong>{formatCurrency(detailVoucher.minOrderValue)}</strong>
              </div>
              <div>
                <span>Số lượng còn lại</span>
                <strong>{Number(detailVoucher.quantity || 0).toLocaleString('vi-VN')}</strong>
              </div>
              <div>
                <span>Ngày bắt đầu</span>
                <strong>{formatDate(detailVoucher.startDate)}</strong>
              </div>
              <div>
                <span>Ngày hết hạn</span>
                <strong>{formatDate(detailVoucher.endDate)}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{detailVoucher.status}</strong>
              </div>
              <div>
                <span>Đang hoạt động</span>
                <strong>{detailVoucher.active ? 'Có' : 'Không'}</strong>
              </div>
            </div>
            <div className="voucher-modal-actions">
              <button type="button" onClick={() => setDetailVoucher(null)}>
                Đóng
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {modalMode ? (
        <div className="voucher-modal-backdrop" role="presentation">
          <form className="voucher-modal" onSubmit={saveVoucher}>
            <div className="voucher-modal-heading">
              <span>{modalMode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'}</span>
              <h2>{modalMode === 'add' ? 'Thêm voucher' : 'Sửa voucher'}</h2>
            </div>

            <div className="voucher-form-grid">
              <label>
                Mã voucher
                <input name="maCode" value={formData.maCode} onChange={handleFormChange} />
              </label>
              <label>
                Loại giảm
                <select name="loaiGiam" value={formData.loaiGiam} onChange={handleFormChange}>
                  <option value="phanTram">Phần trăm</option>
                  <option value="soTien">Số tiền</option>
                </select>
              </label>
              <label>
                Giá trị giảm
                <input
                  name="giaTriGiam"
                  type="number"
                  min="0"
                  value={formData.giaTriGiam}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Đơn hàng tối thiểu
                <input
                  name="donHangToiThieu"
                  type="number"
                  min="0"
                  value={formData.donHangToiThieu}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Số lượng
                <input
                  name="soLuongTon"
                  type="number"
                  min="0"
                  value={formData.soLuongTon}
                  onChange={handleFormChange}
                />
              </label>
              <label>
                Ngày bắt đầu
                <input name="ngayBatDau" type="date" value={formData.ngayBatDau} onChange={handleFormChange} />
              </label>
              <label>
                Ngày hết hạn
                <input name="ngayHetHan" type="date" value={formData.ngayHetHan} onChange={handleFormChange} />
              </label>
              <label>
                Trạng thái
                <select name="trangThai" value={formData.trangThai} onChange={handleFormChange}>
                  <option value="true">Đang bật</option>
                  <option value="false">Đã tắt</option>
                </select>
              </label>
            </div>

            <div className="voucher-modal-actions">
              <button type="button" disabled={isSaving} onClick={closeFormModal}>
                Hủy
              </button>
              <button className="button" type="submit" disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default VoucherManagementPage
