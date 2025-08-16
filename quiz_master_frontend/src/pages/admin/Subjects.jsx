import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import adminApi from "../../lib/adminApi";

export default function Subjects() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const load = () => adminApi.get("/admin/subjects").then(r => setList(r.data.subjects || []));

  useEffect(() => { load(); }, []);

  const create = async () => {
    await adminApi.post("/admin/subjects", { name });
    setName(""); setOpen(false); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Subjects</h2>
        <button onClick={() => setOpen(true)} className="px-3 py-2 bg-indigo-600 text-white rounded">+ New Subject</button>
      </div>

      <div className="bg-white rounded shadow divide-y">
        {list.map((s) => (
          <div key={s.id} className="p-3 flex items-center justify-between">
            <div>{s.name}</div>
            <div className="text-sm text-gray-500">Chapters: {s.chapters || 0}</div>
          </div>
        ))}
        {list.length === 0 && <div className="p-4 text-gray-500">No subjects yet.</div>}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-5 rounded w-[360px]"
              initial={{ scale: .95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .95, opacity: 0 }}>
              <h3 className="font-semibold mb-3">New Subject</h3>
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="border rounded w-full p-2 mb-3"/>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={create} className="px-3 py-1 bg-indigo-600 text-white rounded">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
