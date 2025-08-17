import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiGrid, FiBook, FiBox, FiFileText, FiCheckSquare, FiUsers, FiBarChart2, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import AdminNavbar from "../AdminNavbar";

const navLinks = [
  { to: "/admin", end: true, icon: <FiGrid />, label: "Dashboard" },
  { to: "/admin/subjects", icon: <FiBook />, label: "Subjects" },
  { to: "/admin/chapters", icon: <FiBox />, label: "Chapters" },
  { to: "/admin/quizzes", icon: <FiFileText />, label: "Quizzes" },
  { to: "/admin/questions", icon: <FiCheckSquare />, label: "Questions" },
  { to: "/admin/users", icon: <FiUsers />, label: "Users" },
  { to: "/admin/analytics", icon: <FiBarChart2 />, label: "Analytics" },
];

const NavLinkItem = ({ to, end, icon, label, isCollapsed }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    {icon}
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const activeLink = navLinks.find(link => link.to === currentPath);
    return activeLink ? activeLink.label : "Admin";
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '5rem' : '16rem' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white border-r flex flex-col"
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-16 border-b`}>
          {!isCollapsed && <div className="font-bold text-lg text-blue-600">QuizMaster</div>}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-gray-100">
            {isCollapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          {navLinks.map(link => (
            <NavLinkItem key={link.to} {...link} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="p-3 border-t">
          <button 
            onClick={logout} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <FiLogOut />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
