import { NavLink, Outlet } from 'react-router-dom'
import Card from '../common/Card.jsx'

export default function AdminLayout() {
  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <aside>
        <Card className="p-4 space-y-2 sticky top-4">
          <div className="font-semibold mb-2">Admin</div>
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin" className="hover:text-primary">Dashboard</NavLink>
            <NavLink to="/admin/verifications" className="hover:text-primary">Verifications</NavLink>
            <NavLink to="/admin/escrow" className="hover:text-primary">Escrow Management</NavLink>
            <NavLink to="/admin/disputes" className="hover:text-primary">Disputes</NavLink>
            <NavLink to="/admin/reports" className="hover:text-primary">Financial Reports</NavLink>
            <NavLink to="/admin/settings" className="hover:text-primary">Settings</NavLink>
          </nav>
        </Card>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
