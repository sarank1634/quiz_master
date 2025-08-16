import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../lib/apiClient";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const statCard = (t, v) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow p-4"
  >
    <div className="text-sm text-gray-500">{t}</div>
    <div className="text-2xl font-semibold">{v}</div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, quizzes: 0, subjects: 0, attempts: 0 });
  const [bySubject, setBySubject] = useState([]);

  useEffect(() => {
    api.get("/admin/overview").then(({ data }) => {
      setStats(data.stats);
      setBySubject(data.bySubject || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCard("Users", stats.users)}
        {statCard("Quizzes", stats.quizzes)}
        {statCard("Subjects", stats.subjects)}
        {statCard("Total Attempts", stats.attempts)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">Top Scores by Subject</div>
          <BarChart width={520} height={220} data={bySubject}>
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="topScore" />
          </BarChart>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold mb-2">Attempts per Subject</div>
          <PieChart width={520} height={220}>
            <Pie data={bySubject} dataKey="attempts" nameKey="subject" cx="50%" cy="50%" outerRadius={80}>
              {bySubject.map((_, i) => <Cell key={i} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
