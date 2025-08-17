import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adminApi from "../../lib/adminApi";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiBookOpen, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

const SubjectModal = ({ subject, onClose, onSave, isLoading }) => {
  const [name, setName] = useState(subject ? subject.name : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...subject, name });
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 grid place-items-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !isLoading && onClose()}
    >
      <motion.div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => !isLoading && onClose()}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
        >
          <FiX />
        </button>
        <h3 className="text-xl font-semibold mb-4 pr-8">{subject ? 'Edit Subject' : 'Add New Subject'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Subject Name" className="w-full p-2 border rounded-md" required />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Close modal on ESC key
// Placed outside component scope previously; ensure within a component using effect.

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 10;

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await adminApi.get('/admin/subjects');
      setSubjects(data.subjects || []);
    } catch (err) {
      setError('Failed to fetch subjects.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleSaveSubject = async (subjectData) => {
    try {
      if (subjectData.id) {
        await adminApi.put(`/admin/subjects/${subjectData.id}`, { name: subjectData.name });
      } else {
        await adminApi.post('/admin/subjects', { name: subjectData.name });
      }
      fetchSubjects();
      setIsModalOpen(false);
      setSelectedSubject(null);
    } catch (err) {
      console.error('Failed to save subject', err);
      alert('Error saving subject.');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminApi.delete(`/admin/subjects/${subjectId}`);
        fetchSubjects();
      } catch (err) {
        console.error('Failed to delete subject', err);
        alert('Error deleting subject.');
      }
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Manage Subjects
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-700">
            {filteredSubjects.length} shown
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button 
            onClick={() => { setSelectedSubject(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Fetching subjects..." />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState 
          title="No Subjects Found"
          subtitle={searchTerm ? 'Try adjusting your search.' : 'Create a new subject to get started.'}
          icon={<FiBookOpen size={48} className="mx-auto text-gray-400"/>}
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Chapters</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubjects.map(subject => (
                  <tr key={subject.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4">{subject.chapters || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setSelectedSubject(subject); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><FiEdit /></button>
                      <button onClick={() => handleDeleteSubject(subject.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-gray-700">
                Showing {indexOfFirstSubject + 1} to {Math.min(indexOfLastSubject, filteredSubjects.length)} of {filteredSubjects.length} subjects
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-md disabled:opacity-50"><FiChevronLeft /></button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-md disabled:opacity-50"><FiChevronRight /></button>
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {isModalOpen && <SubjectModal subject={selectedSubject} onClose={() => setIsModalOpen(false)} onSave={handleSaveSubject} />}
      </AnimatePresence>
    </motion.div>
  );
}
