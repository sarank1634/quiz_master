import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const link = ({ isActive }) =>
  `px-3 py-2 rounded text-sm ${isActive ? "bg-indigo-600 text-white" : "hover:bg-gray-100"}`;

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem("token"); nav("/admin/login"); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-4">
        <div className="font-bold text-lg mb-4">Admin • Quiz Master</div>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={link}>Dashboard</NavLink>
          <NavLink to="/admin/subjects" className={link}>Subjects</NavLink>
          <NavLink to="/admin/chapters" className={link}>Chapters</NavLink>
          <NavLink to="/admin/quizzes" className={link}>Quizzes</NavLink>
          <NavLink to="/admin/questions" className={link}>Questions</NavLink>
          <NavLink to="/admin/users" className={link}>Users</NavLink>
          <NavLink to="/admin/analytics" className={link}>Analytics</NavLink>
        </nav>
      </aside>

      <div className="flex-1">
        <motion.header
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-b px-6 py-3 flex items-center justify-between"
        >
          <div className="font-semibold">Admin Panel</div>
          <button onClick={logout} className="text-sm px-3 py-1 rounded bg-red-50 text-red-600">
            Logout
          </button>
        </motion.header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
