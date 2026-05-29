import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

function MainLayout() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
