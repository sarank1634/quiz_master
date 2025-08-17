import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adminApi from "../../lib/adminApi";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

const QuizModal = ({ quiz, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(
    quiz || { title: '', subject: '', chapter: '', duration: 10, questions: 10 }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 grid place-items-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-xl font-semibold mb-4">{quiz ? 'Edit Quiz' : 'Add New Quiz'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Quiz Title" className="w-full p-2 border rounded-md" required />
          <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" className="w-full p-2 border rounded-md" required />
          <input name="chapter" value={formData.chapter} onChange={handleChange} placeholder="Chapter" className="w-full p-2 border rounded-md" />
          <div className="flex gap-4">
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration (mins)" className="w-full p-2 border rounded-md" required />
            <input type="number" name="questions" value={formData.questions} onChange={handleChange} placeholder="No. of Questions" className="w-full p-2 border rounded-md" required />
          </div>
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

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 10;

  const fetchQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await adminApi.get('/admin/quizzes');
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError('Failed to fetch quizzes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleSaveQuiz = async (quizData) => {
    try {
      if (quizData.id) {
        await adminApi.put(`/admin/quizzes/${quizData.id}`, quizData);
      } else {
        await adminApi.post('/admin/quizzes', quizData);
      }
      fetchQuizzes();
      setIsModalOpen(false);
      setSelectedQuiz(null);
    } catch (err) {
      console.error('Failed to save quiz', err);
      alert('Error saving quiz.');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await adminApi.delete(`/admin/quizzes/${quizId}`);
        fetchQuizzes();
      } catch (err) {
        console.error('Failed to delete quiz', err);
        alert('Error deleting quiz.');
      }
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.chapter && quiz.chapter.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manage Quizzes</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button 
            onClick={() => { setSelectedQuiz(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading label="Fetching quizzes..." />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState 
          title="No Quizzes Found"
          subtitle={searchTerm ? 'Try adjusting your search.' : 'Create a new quiz to get started.'}
          icon={<FiFileText size={48} className="mx-auto text-gray-400"/>}
        />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Subject</th>
                  <th scope="col" className="px-6 py-3">Chapter</th>
                  <th scope="col" className="px-6 py-3">Questions</th>
                  <th scope="col" className="px-6 py-3">Duration</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQuizzes.map(quiz => (
                  <tr key={quiz.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{quiz.title}</td>
                    <td className="px-6 py-4">{quiz.subject}</td>
                    <td className="px-6 py-4">{quiz.chapter || 'N/A'}</td>
                    <td className="px-6 py-4">{quiz.questions}</td>
                    <td className="px-6 py-4">{quiz.duration} mins</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setSelectedQuiz(quiz); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><FiEdit /></button>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
               <span className="text-sm text-gray-700">
                Showing {indexOfFirstQuiz + 1} to {Math.min(indexOfLastQuiz, filteredQuizzes.length)} of {filteredQuizzes.length} quizzes
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
        {isModalOpen && <QuizModal quiz={selectedQuiz} onClose={() => setIsModalOpen(false)} onSave={handleSaveQuiz} />}
      </AnimatePresence>
    </motion.div>
  );
}
