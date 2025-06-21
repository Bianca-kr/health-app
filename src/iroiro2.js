// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NotificationSettings from './NotificationSettings';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login'; // ← さっき作ったやつ！
// 追加で import
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Profile from './Profile'; // ← さっき作ったやつ！
import { v4 as uuidv4 } from 'uuid';
import { ReferenceLine } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import InputPage from './InputPage'; // ファイル名と場所が合っていればOK
import GraphPage from './GraphPage';
import HistoryPage from './HistoryPage';
import { db } from './firebase';

import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';


function getDayOfWeek(dateStr) {
  if (!dateStr) return '';
  const days = ['日 Sun', '月 Mon', '火 Tue', '水 Wed', '木 Thu', '金 Fri', '土 Sat'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

const adviceList = [
  "低血糖に注意しましょう。\nWatch out for low blood sugar.",
  "高血糖に注意、水分補給を忘れずに。\nWatch out for high blood sugar, stay hydrated.",
  "血圧が高めなら塩分に気をつけましょう。\nIf your blood pressure is high, watch your salt. ",
  "軽い運動を取り入れましょう。\nIncorporate light exercise.",
  "睡眠をしっかり取りましょう。\nGet a good night's sleep."
];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: 10
        }}
      >
        <p><strong>{label}</strong></p>
        <p>基礎体温: {dayData.basalTemp ?? '-'}</p>
        <p>血糖（朝/昼/夜）: {dayData.bloodSugarMorning ?? '-'}/{dayData.bloodSugarAfternoon ?? '-'}/{dayData.bloodSugarNight ?? '-'}</p>
      </div>
    );
  }
  return null;
};


const COLORS = ['#00C49F', '#FF8042']; // 飲んだ・飲まなかった用の色

const MedicineCard = ({ name, data }) => (
  <div
    style={{
      border: "2px solid #eee",
      borderRadius: "12px",
      padding: "16px",
      width: "250px",
      boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
      background: "#fff"
    }}
  >
    <h4 style={{ marginBottom: "10px" }}>{name}</h4>
    <PieChart width={200} height={200}>
      <Pie
        data={[
          { name: "飲んだ", value: data.taken },
          { name: "飲まなかった", value: data.notTaken }
        ]}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={60}
        label
      >
        {COLORS.map((color, index) => (
          <Cell key={`cell-${index}`} fill={color} />
        ))}
      </Pie>
    </PieChart>
    <p style={{ textAlign: "center" }}>
      割合: {(data.taken / (data.taken + data.notTaken) * 100).toFixed(1)}%
    </p>
  </div>
);



function App() {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [compareWithLastWeek, setCompareWithLastWeek] = useState(false);
  const [data, setData] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState(["薬A", "薬B"]);
  const [newMedicine, setNewMedicine] = useState("");
  const [advice, setAdvice] = useState("");
  const [viewRange, setViewRange] = useState("1month");
  const [editingIndex, setEditingIndex] = useState(null);
  const [exerciseOptions, setExerciseOptions] = useState(["腕立て伏せ", "スクワット", "散歩"]);
  const [newExercise, setNewExercise] = useState("");
  const [showBloodSugar, setShowBloodSugar] = useState(false);
  const [showBloodPressure, setShowBloodPressure] = useState(false);
  const COLORS = ['#00C49F', '#FF8042']; // 飲んだ・飲まなかった
  const [weeklyExerciseGoal, setWeeklyExerciseGoal] = useState(70);

  const exerciseWeeklyRate = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      const end = new Date(now);
      start.setDate(now.getDate() - (7 * (i + 1)));
      end.setDate(now.getDate() - (7 * i));

      const weekData = data.filter(d => {
        const date = new Date(d.date);
        return date >= start && date < end;
      });

      let exerciseDays = weekData.filter(d =>
        Array.isArray(d.exerciseRecords) &&
        d.exerciseRecords.some(r => r.name && Number(r.count) > 0)
      ).length;

      result.push({
        week: `${start.getMonth() + 1}/${start.getDate()}〜${end.getMonth() + 1}/${end.getDate()}`,
        percent: ((exerciseDays / 7) * 100).toFixed(1) // ← ✅ 常に7日で割る
      });
    }

    return result;
  }, [data]);


  useEffect(() => {
    const savedMedicines = localStorage.getItem("medicineOptions");
    if (savedMedicines) {
      setMedicineOptions(JSON.parse(savedMedicines));
    }

    const savedExercises = localStorage.getItem("exerciseOptions");
    if (savedExercises) {
      setExerciseOptions(JSON.parse(savedExercises));
    }
  }, []);






  const initialForm = {
    date: '',
    wakeTime: '',
    basalTemp: '',
    bloodSugarMorning: '',
    bloodSugarAfternoon: '',
    bloodSugarNight: '',
    bpMorningHigh: '',
    bpMorningLow: '',
    bpAfternoonHigh: '',
    bpAfternoonLow: '',
    bpNightHigh: '',
    bpNightLow: '',
    breakfast: '',
    snackMorning: '',
    lunch: '',
    snackAfternoon: '',
    dinner: '',
    snackNight: '',
    medicineMorning: [{ name: '', taken: '' }],
    medicineAfternoon: [{ name: '', taken: '' }],
    medicineNight: [{ name: '', taken: '' }],
    activity: '',
    exercise: '',
    note: '',
    sleepTime: '',
    exerciseRecords: [{ id: uuidv4(), name: "", count: "", unit: "回" }]
  };

  const [form, setForm] = useState(initialForm);

  const calculateExerciseRate = (rangeDays) => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - rangeDays);

    let didExercise = 0;
    let noExercise = 0;

    data.forEach(d => {
      const date = new Date(d.date);
      if (date >= past && date <= now) {
        if (Array.isArray(d.exerciseRecords) && d.exerciseRecords.some(r => r.name && Number(r.count) > 0)) {
          didExercise++;
        } else {
          noExercise++;
        }
      }
    });

    return { didExercise, noExercise };
  };

  const exerciseRate = useMemo(() => calculateExerciseRate(7), [data]);


  const calculateMedicineStats = (rangeDays) => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - rangeDays);

    const filtered = data.filter(d => {
      const date = new Date(d.date);
      return date >= past && date <= now;
    });

    const stats = {};


    filtered.forEach(d => {
      ["medicineMorning", "medicineAfternoon", "medicineNight"].forEach(time => {
        d[time]?.forEach(med => {
          if (!med.name) return;
          if (!stats[med.name]) {
            stats[med.name] = { taken: 0, notTaken: 0 };
          }
          if (med.taken === "飲んだ") {
            stats[med.name].taken += 1;
          } else if (med.taken === "飲まなかった") {
            stats[med.name].notTaken += 1;
          }
        });
      });
    });

    return stats;
  };

  // 1週間のデータ（例）
  const medicineStats = useMemo(() => calculateMedicineStats(7), [data]);
  const medicineStatsMonth = useMemo(() => calculateMedicineStats(30), [data]);
  const medicineStatsHalfYear = useMemo(() => calculateMedicineStats(180), [data]);


  const exerciseRateComment = useMemo(() => {
    if (exerciseWeeklyRate.length < 2) return "まだ十分なデータがありません。\nNot enough data yet.";

    const latest = exerciseWeeklyRate[exerciseWeeklyRate.length - 1].percent;
    const previous = exerciseWeeklyRate[exerciseWeeklyRate.length - 2].percent;

    const diff = latest - previous;

    if (diff > 5) return `前の週より${diff.toFixed(1)}%アップ！頑張りましたね 💪\nUp ${diff.toFixed(1)}% from last week! Good job!`;
    if (diff < -5) return `前の週より${Math.abs(diff).toFixed(1)}%ダウン…無理せずいきましょう 🍵\nDown ${Math.abs(diff).toFixed(1)}% from last week. Take it easy!`;
    return `前の週とほぼ同じですね。コツコツ続けていきましょう！\nAlmost the same as last week. Keep it up!`;
  }, [exerciseWeeklyRate]);


  const ExerciseWeeklyRate = useMemo(() => {
    const weekMap = {};

    data.forEach((d) => {
      if (!d.date || !d.exerciseRecords) return;

      const date = new Date(d.date);
      const year = date.getFullYear();
      const janFirst = new Date(year, 0, 1);
      const days = Math.floor((date - janFirst) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(days / 7);

      const key = `${year}-W${weekNumber}`;

      if (!weekMap[key]) {
        weekMap[key] = { total: 0, days: new Set() };
      }

      const hasExercise = d.exerciseRecords.some(
        (r) => r.name && parseInt(r.count) > 0
      );
      if (hasExercise) {
        weekMap[key].total += 1;
        weekMap[key].days.add(d.date);
      }
    });

    return Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, val]) => ({
        week,
        percent: (val.total / val.days.size) * 100,
      }));
  }, [data]);



  useEffect(() => {
    setAdvice(adviceList[Math.floor(Math.random() * adviceList.length)]);

    const saved = localStorage.getItem("healthData");
    if (saved) setData(JSON.parse(saved));

    const fetchFirestoreData = async () => {
      if (user) {
        const ref = doc(db, 'healthRecords', `${user.uid}_${new Date().toISOString().split('T')[0]}`);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const firestoreData = snapshot.data();
          setForm(prev => ({
            ...initialForm,
            ...firestoreData
          }));
        }
      }
    };



    fetchFirestoreData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'healthRecords'), where('__name__', '>=', `${user.uid}_`), where('__name__', '<', `${user.uid}_\uf8ff`));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push(doc.data());
      });
      records.sort((a, b) => new Date(a.date) - new Date(b.date));
      setData(records);
    });

    return () => unsubscribe(); // リアルタイム購読を解除
  }, [user]);



  useEffect(() => {
    localStorage.setItem("healthData", JSON.stringify(data));
  }, [data]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const snapshot = await getDocs(collection(db, 'healthRecords'));
      const fetchedData = [];

      snapshot.forEach((doc) => {
        fetchedData.push(doc.data());
      });

      // 日付順に並び替え（必要なら）
      fetchedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setData(fetchedData);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (auth.currentUser) {
        const ref = doc(db, 'users', auth.currentUser.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setIsPremium(!!data.isPremium);
        }
      }
    };
    fetchPremiumStatus();
  }, []);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (!user) {
    return <Login onLogin={() => { }} />;
  }


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMedicineChange = (time, idx, field, value) => {
    const updated = form[time].map((m, i) => i === idx ? { ...m, [field]: value } : m);
    setForm({ ...form, [time]: updated });
  };

  const handleAddMedicine = (time) => {
    setForm({
      ...form,
      [time]: [...form[time], { id: uuidv4(), name: '', taken: '' }]
    });
  };

  const handleMedicineOptionAdd = () => {
    if (newMedicine && !medicineOptions.includes(newMedicine)) {
      const updated = [...medicineOptions, newMedicine];
      setMedicineOptions([...medicineOptions, newMedicine]);
      setNewMedicine("");
      localStorage.setItem("medicineOptions", JSON.stringify(updated)); // ← 追加
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = {
      ...form,
      basalTemp: form.basalTemp ? parseFloat(form.basalTemp) : null,
      bloodSugarMorning: form.bloodSugarMorning ? parseFloat(form.bloodSugarMorning) : null,
      bloodSugarAfternoon: form.bloodSugarAfternoon ? parseFloat(form.bloodSugarAfternoon) : null,
      bloodSugarNight: form.bloodSugarNight ? parseFloat(form.bloodSugarNight) : null,
      dayOfWeek: getDayOfWeek(form.date)
    };

    // Firestore に保存
    if (user) {
      const ref = doc(db, 'healthRecords', `${user.uid}_${form.date}`);
      await setDoc(ref, newEntry, { merge: true });
    }

    // ローカルにも保存（必要なら）

    const existingIndex = data.findIndex(d => d.date === form.date);
    let updatedData = [...data];

    if (existingIndex >= 0) {
      updatedData[existingIndex] = {
        ...updatedData[existingIndex],
        ...Object.fromEntries(Object.entries(newEntry).filter(([_, v]) => v !== '' && v !== null))
      };
    } else {
      updatedData = [...updatedData, newEntry];
    }

    updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    setData(updatedData);
    setForm(initialForm);
    setEditingIndex(null);
  };

  const handleDelete = async (date) => {
    if (!user) return;
    if (window.confirm("本当に削除しますか？")) {
      // Firestore から削除
      const ref = doc(db, 'healthRecords', `${user.uid}_${date}`);
      await deleteDoc(ref);

      // ローカルから削除
      setData(data.filter(d => d.date !== date));
    }
  };

  const handleEdit = (date) => {
    const entry = data.find(d => d.date === date);
    if (entry) {
      setForm({
        ...initialForm,  // ← 足りない項目を補う
        ...entry         // ← Firestoreからのデータで上書き
      });

      setEditingIndex(date);
    }
  };



  const filterByRange = (range = viewRange) => {
    const now = new Date();
    const pastDate = new Date();

    if (range === "1week") {
      pastDate.setDate(now.getDate() - 7);
    } else {
      pastDate.setDate(now.getDate() - 30);
    }

    return data.filter(d => {
      const date = new Date(d.date);
      return date >= pastDate && date <= now;
    });
  };

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(now.getDate() - 14);

  const thisWeekData = data.filter(d => {
    const date = new Date(d.date);
    return date >= oneWeekAgo && date < now;
  });
  const lastWeekData = data.filter(d => {
    const date = new Date(d.date);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  });

  const avgBasalTemp = (() => {
    const filtered = filterByRange().filter(d => d.basalTemp != null);
    if (filtered.length === 0) return null;
    const total = filtered.reduce((sum, d) => sum + d.basalTemp, 0);
    return total / filtered.length;
  })();


  const downloadCSV = () => {
    const headers = Object.keys(initialForm);
    const rows = data.map(d => headers.map(h => JSON.stringify(d[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isPremiumUser = isPremium;




  return (
    <Router>
      <div style={{ padding: 20 }}>
        {/* ✅ ナビゲーションはここにまとめて書いておく */}
        <div style={{ textAlign: 'right', marginBottom: 20 }}>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <div style={{ display: "inline-block", textAlign: "center", marginRight: "10px" }}>
              <Link to="/">記入</Link>
              <div style={{ fontSize: "12px", color: "gray" }}>entry</div>
            </div>
            <div style={{ display: "inline-block", textAlign: "center", marginRight: "10px" }}>
              <Link to="/notification">通知設定</Link>
              <div style={{ fontSize: "12px", color: "gray" }}>notifications</div>
            </div>
            <div style={{ display: "inline-block", textAlign: "center", marginRight: "10px" }}>
              <Link to="/graph">グラフ・表</Link>
              <div style={{ fontSize: "12px", color: "gray" }}>graphs</div>
            </div>
            <div style={{ display: "inline-block", textAlign: "center", marginRight: "10px" }}>
              <Link to="/history">過去の記録</Link>
              <div style={{ fontSize: "12px", color: "gray" }}>history</div>
            </div>
            <div style={{ display: "inline-block", textAlign: "center", marginRight: "10px" }}>
              <Link to="/profile">プロフィール</Link>
              <div style={{ fontSize: "12px", color: "gray" }}>profile</div>
            </div>
            <button onClick={() => signOut(auth)}>ログアウト</button>
          </div>



        </div>

        {/* ✅ ページの切り替えはここで */}
        <Routes>
          <Route path="/" element={
            <div>
              <h2>健康記録アプリ Health Record App</h2>
              <p style={{
                color: "#001f3f",         // 深い紺色
                backgroundColor: "#f0f8ff", // 薄い水色背景
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "bold"
              }}>
                Today's Advice:
                <br />
                {advice.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>



              <InputPage
                form={form}
                setForm={setForm}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleAddMedicine={handleAddMedicine}
                handleMedicineChange={handleMedicineChange}
                medicineOptions={medicineOptions}
                newMedicine={newMedicine}
                setNewMedicine={setNewMedicine}
                handleMedicineOptionAdd={handleMedicineOptionAdd}
                newExercise={newExercise}
                setNewExercise={setNewExercise}
                exerciseOptions={exerciseOptions}
                setExerciseOptions={setExerciseOptions}
                editingIndex={editingIndex}
              />

              {isPremium && (
                <div style={{
                  backgroundColor: '#e6ffe6', // 薄い黄緑
                  borderRadius: '16px',
                  padding: '20px',
                  marginTop: '20px',
                  boxShadow: '0 4px 12px rgba(100, 200, 100, 0.3)',
                  fontFamily: 'sans-serif',
                  border: '2px solid #b2ffb2'
                }}>
                  <h3 style={{ color: '#2e8b57', marginBottom: '10px' }}>🌟 プレミアム機能</h3>
                  <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    <li>通知回数：無制限</li>

                    <li>グラフのPDF出力</li>
                  </ul>
                  <p style={{ color: '#555' }}>
                    ありがとうございます！プレミアム機能をご利用いただけます。
                  </p>
                </div>
              )}

              <button
                onClick={async () => {
                  const newStatus = !isPremium;
                  if (auth.currentUser) {
                    const ref = doc(db, 'users', auth.currentUser.uid);
                    await setDoc(ref, { isPremium: newStatus }, { merge: true });
                    setIsPremium(newStatus);
                    alert(`プレミアム機能を${newStatus ? '有効' : '無効'}にしました`);
                  }
                }}
                style={{
                  marginTop: '16px',
                  backgroundColor: isPremium ? '#cccccc' : '#90ee90',
                  color: '#000',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {isPremium ? 'プレミアムを無効にする' : 'プレミアムを有効にする'}
              </button>

              {!isPremium && (
                <p style={{ color: 'gray', marginTop: '8px' }}>
                  プレミアム機能を使うにはアップグレードしてください！
                </p>
              )}




              <NotificationSettings isPremium={isPremium} />





              {/* 1週間 */}

              <h3 style={{ lineHeight: "1.4" }}>
                💊 1週間の服薬状況
                <br />
                <span style={{ fontSize: "14px", color: "gray" }}>Weekly medication status</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {Object.entries(medicineStats).map(([name, data]) => (
                  <MedicineCard key={name} name={name} data={data} />
                ))}
              </div>

              {/* 1か月 */}
              
              <h3 style={{ lineHeight: "1.4" }}>
                🗓️ 1か月の服薬状況
                <br />
                <span style={{ fontSize: "14px", color: "gray" }}>Medication status at 1 months</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {Object.entries(medicineStatsMonth).map(([name, data]) => (
                  <MedicineCard key={name} name={name} data={data} />
                ))}
              </div>

              {/* 半年 */}
              <h3 style={{ lineHeight: "1.4" }}>
                🗓️ 6か月の服薬状況
                <br />
                <span style={{ fontSize: "14px", color: "gray" }}>Medication status at 6 months</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {Object.entries(medicineStatsHalfYear).map(([name, data]) => (
                  <MedicineCard key={name} name={name} data={data} />
                ))}
              </div>
              <div style={{
                border: "2px solid #eee",
                borderRadius: "12px",
                padding: "16px",
                width: "250px",
                boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                background: "#fff",
                marginTop: "30px"
              }}>
                <h4 style={{ marginBottom: "10px" }}>🏃‍♂️ 今週の運動率</h4>
                <PieChart width={200} height={200}>
                  <Pie
                    data={[
                      { name: "運動した", value: exerciseRate.didExercise },
                      { name: "しなかった", value: exerciseRate.noExercise }
                    ]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                </PieChart>
                {exerciseRate && (
                  <p style={{ textAlign: "center" }}>
                    今週は <strong>
                      {(() => {
                        const total = exerciseRate.didExercise + exerciseRate.noExercise;
                        const percent = total === 0 ? 0 : (exerciseRate.didExercise / total) * 100;
                        return `${percent.toFixed(1)}%`;
                      })()}
                    </strong> 運動しました
                  </p>
                )}

              </div>

              <h3 style={{ lineHeight: "1.4" }}>
                📈 週ごとの運動実施率
                <br />
                <span style={{ fontSize: "14px", color: "gray" }}>Weekly Exercise Rate</span>
              </h3>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={exerciseWeeklyRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => (typeof v === 'number' ? `${v.toFixed(1)}%` : `${v}%`)} />

                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percent"
                      stroke="#82ca9d"
                      name="運動率"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ fontStyle: 'italic', color: '#555', marginTop: '10px' }}>
                {exerciseRateComment.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>



              {/* 🎯 目標入力欄 */}
              <div style={{ marginTop: '10px' }}>
                <label>
                  🎯 一週間の運動目標（%）：
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weeklyExerciseGoal}
                    onChange={(e) => setWeeklyExerciseGoal(Number(e.target.value))}
                    style={{ marginLeft: '10px', width: '60px' }}
                  />
                  %
                </label>
              </div>

              {/* 💬 結果コメント */}
              {typeof weeklyExerciseGoal === 'number' && (
                <p style={{ fontWeight: 'bold', marginTop: '8px' }}>
                  {exerciseRate?.didExercise + exerciseRate?.noExercise === 0
                    ? 'まだデータがありません。'
                    : (() => {
                      const actual = (exerciseRate.didExercise / (exerciseRate.didExercise + exerciseRate.noExercise)) * 100;
                      if (actual >= weeklyExerciseGoal) return '🎉 達成！よくがんばりました！';
                      if (actual >= weeklyExerciseGoal * 0.8) return '💪 あともう少しで達成！';
                      return '📈 続けていきましょう！';
                    })()
                  }
                </p>
              )}



              {/* 🔁 比較トグルボタン */}
              <div style={{
                backgroundColor: '#fffbe6',
                border: '2px solid #ffe58f',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '20px',
                marginBottom: '20px',
                boxShadow: '2px 2px 8px rgba(255, 204, 0, 0.2)'
              }}>
                <button
                  onClick={() => setCompareWithLastWeek(!compareWithLastWeek)}
                  style={{
                    backgroundColor: '#ffec3d',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#333',
                    boxShadow: '0 4px 8px rgba(255, 193, 7, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {compareWithLastWeek ? '比較をやめる' : '前の週と比較'}
                </button>
              </div>





              {Array.isArray(thisWeekData) && (
                <div style={{
                  backgroundColor: '#fff8cc',  // カード全体：やさしい黄色
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                  fontFamily: 'sans-serif',
                }}>
                  <h4 style={{
                    marginBottom: '16px',
                    color: '#f39c12',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    🌡️ 基礎体温グラフ
                  </h4>

                  <div style={{
                    backgroundColor: '#ffffff',  // ← グラフ部分：白！
                    borderRadius: '12px',
                    padding: '12px'
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={thisWeekData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[35, 38]} />
                        <Tooltip
                          content={({ active, payload, label }) => (
                            <CustomTooltip
                              active={active}
                              payload={payload}
                              label={label}

                            />
                          )}
                        />


                        <Legend />

                        {/* 今週の線（青） */}
                        <Line
                          type="monotone"
                          dataKey="basalTemp"
                          stroke="#8884d8"
                          name="基礎体温（今週）"
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />

                        {/* 🔁 平均ライン */}
                        {avgBasalTemp && (
                          <ReferenceLine
                            y={avgBasalTemp}
                            stroke="orange"
                            strokeDasharray="4 4"
                            label={`平均: ${avgBasalTemp.toFixed(2)}℃`}
                          />
                        )}

                        {/* 🔁 比較用：先週の線（赤） */}
                        {compareWithLastWeek && (
                          <Line
                            type="monotone"
                            data={lastWeekData}
                            dataKey="basalTemp"
                            stroke="#ff4d4f"
                            name="基礎体温（先週）"
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        )}
                      </LineChart>

                    </ResponsiveContainer>
                  </div>
                </div>
              )}



              {Array.isArray(filterByRange()) && (
                <div style={{
                  backgroundColor: '#fff8cc',  // カード全体：やさしい黄色
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                  fontFamily: 'sans-serif',
                }}>
                  <h4 style={{
                    marginBottom: '16px',
                    color: '#f39c12',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    🌡️ 血糖値グラフ
                  </h4>

                  <div style={{
                    backgroundColor: '#ffffff',  // ← グラフ部分：白！
                    borderRadius: '12px',
                    padding: '12px'
                  }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={filterByRange()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bloodSugarMorning" stroke="#82ca9d" name="血糖値（朝）" />
                        <Line type="monotone" dataKey="bloodSugarAfternoon" stroke="#ff7300" name="血糖値（昼）" />
                        <Line type="monotone" dataKey="bloodSugarNight" stroke="#ff0000" name="血糖値（夜）" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}


              <table border="1" cellPadding="4" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>基礎体温</th>
                    <th>血糖値（朝/昼/夜）</th>
                    <th>血圧（朝/昼/夜 上/下）</th>
                    <th>朝食</th>
                    <th>昼食</th>
                    <th>夕食</th>

                    <th>備考</th>
                    <th>操作</th>

                  </tr>
                </thead>
                <tbody>
                  {data.sort((a, b) => new Date(b.date) - new Date(a.date)).map((d, i) => (
                    <tr key={i}>
                      <td>{d.date}（{d.dayOfWeek}）</td>
                      <td>{d.basalTemp ?? '-'}</td>
                      <td>{[d.bloodSugarMorning, d.bloodSugarAfternoon, d.bloodSugarNight].map(v => v ?? '-').join('/')}</td>
                      <td>
                        {`${d.bpMorningHigh ?? '-'}-${d.bpMorningLow ?? '-'}/`}
                        {`${d.bpAfternoonHigh ?? '-'}-${d.bpAfternoonLow ?? '-'}/`}
                        {`${d.bpNightHigh ?? '-'}-${d.bpNightLow ?? '-'}`}
                      </td>
                      <td>{d.breakfast || '-'}</td>
                      <td>{d.lunch || '-'}</td>
                      <td>{d.dinner || '-'}</td>


                      <td>{d.note || '-'}</td>


                      <td>
                        <button onClick={() => handleEdit(d.date)}>編集</button>
                        <button onClick={() => handleDelete(d.date)}>削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          } />
          <Route path="/notification" element={<NotificationSettings isPremium={isPremium} />} />
          <Route
            path="/graph"
            element={
              <GraphPage
                medicineStats={medicineStats}
                medicineStatsMonth={medicineStatsMonth}
                medicineStatsHalfYear={medicineStatsHalfYear}
                exerciseRate={exerciseRate}
                exerciseWeeklyRate={exerciseWeeklyRate}
                exerciseRateComment={exerciseRateComment}
                thisWeekData={thisWeekData}
                lastWeekData={lastWeekData}
                compareWithLastWeek={compareWithLastWeek}
                setCompareWithLastWeek={setCompareWithLastWeek}
                avgBasalTemp={avgBasalTemp}
                filterByRange={filterByRange} // ← これがないと今のエラーになります！
                weeklyExerciseGoal={weeklyExerciseGoal} // ← 追加
                setWeeklyExerciseGoal={setWeeklyExerciseGoal} // ← 追加
                oneMonthData={filterByRange("1month")} // ← ⭐️これを追加！
                isPremiumUser={isPremiumUser}
              />
            }
          />
          {/* ← グラフページも作る想定 */}
          <Route
            path="/history"
            element={
              <HistoryPage
                data={data}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            }
          />
          {/* ← 過去の記録も作る想定 */}

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}



export default App;
