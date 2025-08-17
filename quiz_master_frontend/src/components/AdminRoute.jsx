import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import adminApi from "../lib/adminApi";

export default function AdminRoute() {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setAllowed(false);
    adminApi
      .get("/auth/profile")
      .then((res) => {
        const role = res.data?.user?.role;
        const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
        setAllowed(roleLower === "admin" || roleLower === "superadmin");
      })
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) {
    return (
      <div className="p-8">
        Checking admin access...
      </div>
    );
  }

  return allowed ? <Outlet /> : <Navigate to="/admin/login" replace />;
}