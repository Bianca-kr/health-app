// src/CollapsibleExerciseGraphs.js
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CollapsibleExerciseGraphs = ({ data, forceExpand = false }) => {
  const [openGraphs, setOpenGraphs] = useState({});
  // 日付ごとに運動の合計を集計（単位無視）
  const exerciseData = useMemo(() => {
    const dateMap = {};
    const allExercises = new Set();

    data.forEach((entry) => {
      const date = entry.date;
      if (!dateMap[date]) {
        dateMap[date] = {};
      }

      if (Array.isArray(entry.exerciseRecords)) {
        entry.exerciseRecords.forEach((rec) => {
          const name = rec.name;
          if (!name) return;

          allExercises.add(name);
          const count = Number(rec.count) || 0;
          dateMap[date][name] = (dateMap[date][name] || 0) + count;
        });
      }
    });

    const result = Object.entries(dateMap).map(([date, exercises]) => {
      const row = { date };
      allExercises.forEach((name) => {
        row[name] = exercises[name] || 0;
      });
      return row;
    });

    // 日付順に並べる
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return { result, allExercises: Array.from(allExercises) };
  }, [data]);
  // useEffectでforceExpandの時すべて展開
  React.useEffect(() => {
    if (forceExpand) {
      const all = {};
      exerciseData.allExercises.forEach(name => {
        all[name] = true;
      });
      setOpenGraphs(all);
    }
  }, [forceExpand, exerciseData.allExercises]);
  // グラフ表示を切り替える関数
  const toggleGraph = (exercise) => {
    setOpenGraphs((prev) => ({ ...prev, [exercise]: !prev[exercise] }));
  };

  

  return (
    <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0, 0, 255, 0.1)' }}>
      <h3 style={{ color: '#1e90ff', marginBottom: '16px' }}>🏋️ 運動記録グラフ</h3>
      {exerciseData.allExercises.map((exercise) => (
        <div key={exercise} style={{ marginBottom: '24px', background: '#ffffff', borderRadius: '12px', padding: '12px', boxShadow: '0 1px 6px rgba(0,0,128,0.1)' }}>
          <button
            onClick={() => toggleGraph(exercise)}
            style={{
              backgroundColor: '#1e90ff',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '12px',
              fontWeight: 'bold'
            }}
          >
            {openGraphs[exercise] ? '▼' : '▶'} {exercise}
          </button>
          <div className="collapsible-content" style={{ display: openGraphs[exercise] ? 'block' : 'none' }}>
            {openGraphs[exercise] && (

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={exerciseData.result}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={exercise}
                    stroke="#1e90ff"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollapsibleExerciseGraphs;
