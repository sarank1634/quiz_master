import { useState  } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/apiClient";
import {motion} from "framer-motion";

export default function AdminLogin() {
    const [form, useForm] = useState({email: "", password: ""});
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErr(""); 
        setLoading(true);
        try {
            const {data} = await api.post('/auth/admin/login', form);
            localStorage.setItem("token", data.token);
            nav("/admin");
        } catch (e) {
            setErr(e?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
        <motion.div
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-[380px] rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 text-white shadow-xl"
        >
          <h1 className="text-2xl font-bold mb-1">Admin Login</h1>
          <p className="text-white/70 mb-6">Restricted area. Admins only.</p>
  
          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 outline-none"
              placeholder="Admin Email"
              type="email"
              value={form.email}
              onChange={e => useForm({ ...form, email: e.target.value })}
            />
            <input
              className="w-full bg-white/10 border border-white/30 rounded-lg p-3 outline-none"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => useForm({ ...form, password: e.target.value })}
            />
            {err && <div className="text-red-200 text-sm">{err}</div>}
  
            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-white text-gray-900 hover:bg-gray-100 transition"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }