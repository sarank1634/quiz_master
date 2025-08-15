// src/components/SummaryCharts.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8','#82ca9d','#ffc658','#ff7f50','#a4de6c'];

export default function SummaryCharts({ quizzes = [], scores = [] }) {
  // aggregate best score per subject
  const bySubject = useMemo(() => {
    const map = {};
    quizzes.forEach(q => { map[q.subject] = { subject: q.subject, top: 0, attempts: 0 }; });
    scores.forEach(s => {
      const quiz = quizzes.find(q => q.id === s.quizId);
      const subj = (quiz && quiz.subject) || 'Unknown';
      map[subj] = map[subj] || { subject: subj, top: 0, attempts: 0 };
      map[subj].attempts += 1;
      map[subj].top = Math.max(map[subj].top, Math.round((s.score||0)*100));
    });
    return Object.values(map);
  }, [quizzes, scores]);

  const pieData = bySubject.map((b,i) => ({ name: b.subject, value: b.attempts || 1 }));

  return (
    <div className="space-y-3">
      <div style={{ width: '100%', height: 160 }}>
        <BarChart data={bySubject} width={500} height={160}>
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="top" >
            {bySubject.map((entry, idx) => <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </div>

      <div style={{ width: '100%', height: 160 }} className="flex justify-center">
        <PieChart width={200} height={160}>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
            {pieData.map((_, i) => <Cell key={`p-${i}`} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
}
