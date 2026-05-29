import { mockUsers } from '../../data/mockUsers'

function AccountManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý tài khoản</h1>
      <div className="table-like">
        {mockUsers.map((user) => (
          <div className="table-row" key={user.id}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span>{user.role}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default AccountManagementPage
