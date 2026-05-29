import { mockVouchers } from '../../data/mockVouchers'

function VoucherManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý voucher</h1>
      <div className="table-like">
        {mockVouchers.map((voucher) => (
          <div className="table-row" key={voucher.id}>
            <strong>{voucher.code}</strong>
            <span>Giảm: {voucher.discount.toLocaleString('vi-VN')}</span>
            <span>{voucher.status}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default VoucherManagementPage
