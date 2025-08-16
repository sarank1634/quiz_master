import { useEffect, useState } from "react";
import {AnimatePresence, motion} from 'framer-motion'
import adminApi from '../lib/adminApi';

export default function Subject() {
    const [List, setList] = useState([]);
    comst [open, setOpen] = useState([]);
    const[name, setName] = useState({});

    const load =() =>  adminApi.get("/admin/subjects")
    .then(r => setList(r.data.Subject || []));

    useEffect(() => { load(), []});

    const create = async() => {
        await adminApi.post("/admin/subjects", {name});
        setName(""); setOpen(false); load();
    };

    return (
        <div>
        <h2 className="text-2xl font-bold mb-4">Subjects</h2>
  
        {/* Add Form */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-semibold mb-2">Add Subject</h3>
          <input
            type="text"
            placeholder="Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            className="border p-2 mr-2 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newSubject.description}
            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
            className="border p-2 mr-2 rounded"
          />
          <button onClick={addSubject} className="bg-blue-600 text-white px-4 py-2 rounded">
            Add
          </button>
        </div>
  
        {/* Table */}
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.description}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteSubject(s.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
 }