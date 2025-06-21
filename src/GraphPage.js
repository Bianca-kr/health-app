// src/GraphPage.js
import React, { useState, useEffect } from 'react';
import CollapsibleExerciseGraphs from './CollapsibleExerciseGraphs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
const COLORS = ['#00C49F', '#FF8042'];
// 価値観グラフ用のカラーパレット
const valueColorList = [
  "#2196f3", "#4caf50", "#ff9800", "#e91e63", "#673ab7", "#009688"
];

// 1か月分のデータを受け取って、日付ごとにvalueスコアを並べ替え
function getValueScoreSeries(oneMonthData) {
  if (!oneMonthData || oneMonthData.length === 0) return { series: [], valueNames: [] };

  // すべてのvalue名
  const valueNames = Array.from(new Set(
    oneMonthData.flatMap(d => (Array.isArray(d.values) ? d.values.map(v => v.name) : []))
  ));

  // 日付ごとにvalueスコアをセット
  const series = oneMonthData.map(d => {
    const obj = { date: d.date };
    if (Array.isArray(d.values)) {
      valueNames.forEach(name => {
        const v = d.values.find(x => x.name === name);
        obj[name] = v ? v.score : null;
      });
    }
    return obj;
  });

  return { series, valueNames };
}


const MedicineCard = ({ name, data }) => (
  <div style={{
    border: "2px solid #eee",
    borderRadius: "12px",
    padding: "16px",
    width: "250px",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
    background: "#fff"
  }}>
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dayData = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: 10,
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      >
        <p><strong>{label}</strong></p>
        <p>
          基礎体温: {dayData.basalTemp ?? '-'}
          <br />
          <span style={{ fontSize: '12px', color: 'gray' }}>
            Basal Temp
          </span>
        </p>


      </div>
    );
  }
  return null;
};


const GraphPage = ({
  medicineStats,
  medicineStatsMonth,
  medicineStatsHalfYear,
  exerciseRate,
  exerciseWeeklyRate,
  exerciseRateComment,
  thisWeekData,
  lastWeekData,
  compareWithLastWeek,
  setCompareWithLastWeek,
  avgBasalTemp,
  filterByRange,
  weeklyExerciseGoal,          // ← 追加
  setWeeklyExerciseGoal,        // ← 追加
  oneMonthData,  // ← ⭐️ これを追加！

}) => {
  const [forceExpandGraphs, setForceExpandGraphs] = React.useState(false);
  useEffect(() => {
    const savedGoal = localStorage.getItem("weeklyExerciseGoal");
    if (savedGoal !== null) {
      setWeeklyExerciseGoal(Number(savedGoal));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weeklyExerciseGoal", weeklyExerciseGoal);
  }, [weeklyExerciseGoal]);

  const avgMonthlyBasalTemp = Array.isArray(oneMonthData)
    ? (
      oneMonthData.filter(d => d.basalTemp !== undefined && d.basalTemp !== null)
        .reduce((sum, d) => sum + Number(d.basalTemp), 0)
      /
      oneMonthData.filter(d => d.basalTemp !== undefined && d.basalTemp !== null).length
    )
    : null;

  const exportMonthlyReportAsPDF = async () => {
    setForceExpandGraphs(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = document.getElementById('monthly-report');
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();   // ✅ 幅（固定）
    const pdfHeight = pdf.internal.pageSize.getHeight(); // ✅ 高さを取得 ←これが必要！

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    while (position < imgHeight) {
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
      position += pdfHeight;
      if (position < imgHeight) pdf.addPage();
    }


    pdf.save(`monthly_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setForceExpandGraphs(false);
  };

  const exportExerciseReportAsPDF = async () => {
    setForceExpandGraphs(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = document.getElementById('exercise-report');
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    while (position < imgHeight) {
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
      position += pdfHeight;
      if (position < imgHeight) pdf.addPage();
    }

    pdf.save(`exercise_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setForceExpandGraphs(false);
  };
  const [showExerciseTab, setShowExerciseTab] = React.useState(true);


  return (
    <div>



      <h2>📊 グラフ・表 / Graphs & Tables</h2>

      {/* 1週間 */}
      <h3 style={{ lineHeight: "1.4" }}>
        💊 1週間の服薬状況
        <br />
        <span style={{ fontSize: "14px", color: "gray" }}>Weekly medication status</span>
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {medicineStats && Object.entries(medicineStats).map(([name, data]) => (

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
        {medicineStatsMonth && Object.entries(medicineStatsMonth).map(([name, data]) => (

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
        {medicineStatsHalfYear && Object.entries(medicineStatsHalfYear).map(([name, data]) => (

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
        <h4 style={{ marginBottom: "10px", lineHeight: "1.4" }}>
          🏃‍♂️ 今週の運動率
          <br />
          <span style={{ fontSize: "12px", color: "gray" }}>
            This Week's Exercise Rate
          </span>
        </h4>

        {exerciseRate && (
          <PieChart width={200} height={200}>
            <Pie
              data={[
                { name: "運動した (Exercised)", value: exerciseRate.didExercise },
                { name: "しなかった (Skipped)", value: exerciseRate.noExercise }
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
        )}
        {exerciseRate && (
          <p style={{ textAlign: "center" }}>
            今週は <strong>
              {(() => {
                const total = exerciseRate.didExercise + exerciseRate.noExercise;
                const percent = total === 0 ? 0 : (exerciseRate.didExercise / total) * 100;
                return `${percent.toFixed(1)}%`;
              })()}
            </strong> 運動しました
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              {(() => {
                const total = exerciseRate.didExercise + exerciseRate.noExercise;
                const percent = total === 0 ? 0 : (exerciseRate.didExercise / total) * 100;
                return `${percent.toFixed(1)}% exercised this week`;
              })()}
            </span>
          </p>

        )}

      </div>

      <h3 style={{ lineHeight: "1.4" }}>
        📈 週ごとの運動実施率
        <br />
        <span style={{ fontSize: "14px", color: "gray" }}>Weekly Exercise Rate</span>
      </h3>

      {Array.isArray(exerciseWeeklyRate) && (
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
                name="運動率 / Exercise rate"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <p style={{ fontStyle: 'italic', color: '#555', marginTop: '10px' }}>
        {exerciseRateComment.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>



      {/* 🎯 目標入力欄 */}
      <div style={{ marginTop: '10px', marginBottom: '18px' }}>
        <label style={{ display: "inline-block", lineHeight: "1.4" }}>
          🎯 一週間の運動目標（%）：
          <br />
          <span style={{ fontSize: "12px", color: "gray" }}>
            Weekly Exercise Goal (%)
          </span>
          <br />
          <input
            type="number"
            min="0"
            max="100"
            value={weeklyExerciseGoal}
            onChange={(e) => setWeeklyExerciseGoal(Number(e.target.value))}
            style={{ marginTop: "6px", width: '60px' }}
          />
          %
        </label>

      </div>

      {/* 💬 結果コメント */}
      {typeof weeklyExerciseGoal === 'number' && (
        <p style={{ fontWeight: 'bold', marginTop: '8px', lineHeight: '1.4' }}>
          {exerciseRate?.didExercise + exerciseRate?.noExercise === 0 ? (
            <>
              まだデータがありません。
              <br />
              <span style={{ fontSize: '12px', color: 'gray' }}>No data available yet.</span>
            </>
          ) : (() => {
            const actual = (exerciseRate.didExercise / (exerciseRate.didExercise + exerciseRate.noExercise)) * 100;

            if (actual >= weeklyExerciseGoal) {
              return (
                <>
                  🎉 達成！よくがんばりました！
                  <br />
                  <span style={{ fontSize: '12px', color: 'gray' }}>Goal achieved! Great job!</span>
                </>
              );
            }

            if (actual >= weeklyExerciseGoal * 0.8) {
              return (
                <>
                  💪 あともう少しで達成！
                  <br />
                  <span style={{ fontSize: '12px', color: 'gray' }}>Almost there! Keep going!</span>
                </>
              );
            }

            return (
              <>
                📈 続けていきましょう！
                <br />
                <span style={{ fontSize: '12px', color: 'gray' }}>Keep it up and stay consistent!</span>
              </>
            );
          })()}
        </p>
      )}


    

      <button onClick={exportMonthlyReportAsPDF}
        style={{
          backgroundColor: '#ffecb3', // 明るい黄色
          border: '2px solid #ffd54f',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#5d4037',
          boxShadow: '2px 4px 10px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          marginBottom: '24px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#fff176'; // ホバーで明るく
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#ffecb3';
        }}>
        📄 基礎体温等PDFレポートを出力
      </button>

      <div id="monthly-report">
        {Array.isArray(oneMonthData) && (
          <div style={{
            backgroundColor: '#fff8cc', // やさしい黄色
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
              fontWeight: 'bold',
              lineHeight: '1.4'
            }}>
              🌡️ 基礎体温グラフ（1か月）
              <br />
              <span style={{ fontSize: '12px', color: 'gray' }}>
                Basal Temperature (1 Month)
              </span>
            </h4>

            <div style={{
              backgroundColor: '#ffffff',  // グラフ部分
              borderRadius: '12px',
              padding: '12px'
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={oneMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[35, 38]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />


                  <Line
                    type="monotone"
                    dataKey="basalTemp"
                    stroke="#8884d8"
                    name="基礎体温（1か月）/ Basal Temp (1 Month)"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  {avgMonthlyBasalTemp && (
                    <ReferenceLine
                      y={avgMonthlyBasalTemp}
                      stroke="orange"
                      strokeDasharray="4 4"
                      label={`平均 average: ${avgMonthlyBasalTemp.toFixed(2)}℃`}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}



        {/* 🌞 起床時間カード */}
        {Array.isArray(oneMonthData) && (
          <div style={{
            backgroundColor: '#e0f7fa',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 191, 255, 0.3)',
            fontFamily: 'sans-serif',
          }}>
            <h4 style={{
              marginBottom: '16px',
              color: '#00796b',
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: '1.4'
            }}>
              ☀️ 起床時間グラフ / Wake Time
            </h4>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={oneMonthData.map(d => ({
                ...d,
                wakeMinutes: d.wakeTime ? Number(d.wakeTime.split(":")[0]) * 60 + Number(d.wakeTime.split(":")[1]) : null
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[240, 600]}  // 04:00 = 240分, 10:00 = 600分
                  tickFormatter={(v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`}
                  reversed  // ←これを追加！！
                />

                <Tooltip formatter={(v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="wakeMinutes"
                  stroke="#00796b"
                  strokeWidth={2}
                  name="起床時間 / Wake Time"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 🌙 就寝時間カード */}
        {Array.isArray(oneMonthData) && (
          <div style={{
            backgroundColor: '#fce4ec',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(255, 64, 129, 0.3)',
            fontFamily: 'sans-serif',
          }}>
            <h4 style={{
              marginBottom: '16px',
              color: '#d81b60',
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: '1.4'
            }}>
              🌙 就寝時間グラフ / Sleep Time
            </h4>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={oneMonthData.map(d => ({
                ...d,
                sleepMinutes:
                  d.sleepTime
                    ? (() => {
                      const [h, m] = d.sleepTime.split(":").map(Number);
                      const minutes = h * 60 + m;
                      return minutes < 720 ? minutes + 1440 : minutes; // 12:00未満 → 翌日扱い
                    })()
                    : null

              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[1260, 1680]}  // 21:00〜03:00（= 翌日3:00 → 1620）
                  tickFormatter={(v) => {
                    const realMinutes = v % 1440;
                    return `${Math.floor(realMinutes / 60)}:${String(realMinutes % 60).padStart(2, '0')}`;

                  }}
                  reversed  // ←これを追加！！
                />

                <Tooltip formatter={(v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sleepMinutes"
                  stroke="#d81b60"
                  strokeWidth={2}
                  name="就寝時間 / Sleep Time"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ▼ 価値観グラフ ----------------- */}
        {(() => {
          const { series, valueNames } = getValueScoreSeries(oneMonthData);

          if (series.length === 0) return null;

          return (
            <div style={{
              background: "#ede7f6",
              borderRadius: "18px",
              padding: "30px 18px",
              margin: "36px 0 0 0",
              boxShadow: "0 4px 16px #2196f355"
            }}>
              <h3 style={{ color: "#673ab7", marginBottom: 18 }}>
                💎 価値観スコアの推移
                <br />
                <span style={{ fontSize: "13px", color: "gray" }}>
                  Values Score Trend
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Legend />
                  {valueNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={valueColorList[i % valueColorList.length]}
                      name={`${name}`}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
      </div>
      {/* ▼運動グラフ・タブ */}
      <div style={{
        display: "flex",
        gap: 12,
        margin: "32px 0 16px 0",
      }}>
        <button
          style={{
            background: showExerciseTab
              ? "linear-gradient(90deg, #57d5ff 30%, #008cff 100%)"
              : "#e3f2fd",
            color: showExerciseTab ? "#fff" : "#0277bd",
            border: "none",
            borderRadius: "20px",
            padding: "10px 32px",
            fontWeight: "bold",
            fontSize: "17px",
            boxShadow: showExerciseTab
              ? "0 2px 8px rgba(0,140,255,0.18)"
              : "0 1px 4px #bbb2",
            cursor: "pointer",
            transition: "all .2s",
            letterSpacing: "1px"
          }}
          onClick={() => setShowExerciseTab((v) => !v)}
        >
          {showExerciseTab ? "🏃‍♂️ 運動グラフを隠す / Hide Exercise" : "🏃‍♂️ 運動グラフを表示 / Show Exercise"}
        </button>
      </div>
      {showExerciseTab && (
        <>
          <button onClick={exportExerciseReportAsPDF}
            style={{
              backgroundColor: '#cceeff', // 明るい黄色
              border: '2px solid #66ccff',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#003366',
              boxShadow: '2px 4px 10px rgba(0,128,255,0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fff176'; // ホバーで明るく
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ffecb3';
            }}>
            📄 運動PDFレポートを出力
          </button>

          <div id="exercise-report">
            <CollapsibleExerciseGraphs data={oneMonthData} forceExpand={true} />
          </div >
        </>
      )}


    </div>

  );
};


export default GraphPage;
