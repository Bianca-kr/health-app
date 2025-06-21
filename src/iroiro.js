// src/GraphPage.js
import React from 'react';
import CollapsibleExerciseGraphs from './CollapsibleExerciseGraphs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
const COLORS = ['#00C49F', '#FF8042'];

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
        <p>基礎体温: {dayData.basalTemp ?? '-'}</p>
        <p>血糖（朝/昼/夜）: {dayData.bloodSugarMorning ?? '-'}/{dayData.bloodSugarAfternoon ?? '-'}/{dayData.bloodSugarNight ?? '-'}</p>

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
  isPremiumUser // ← ⭐️ 追加！
}) => {
  const [forceExpandGraphs, setForceExpandGraphs] = React.useState(false);
  const avgMonthlyBasalTemp = Array.isArray(oneMonthData)
    ? (
      oneMonthData.filter(d => d.basalTemp !== undefined && d.basalTemp !== null)
        .reduce((sum, d) => sum + Number(d.basalTemp), 0)
      /
      oneMonthData.filter(d => d.basalTemp !== undefined && d.basalTemp !== null).length
    )
    : null;

  const exportMonthlyReportAsPDF = async () => {
    setForceExpandGraphs(true); // 折りたたみグラフをすべて展開
    await new Promise(resolve => setTimeout(resolve, 500)); // DOM描画のために少し待つ

    const input = document.getElementById('monthly-report');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    while (position < imgHeight) {
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
      position += pdfHeight;
      if (position < imgHeight) pdf.addPage();
    }

    pdf.save(`monthly_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    setForceExpandGraphs(false); // 終わったら元に戻す
  };



  return (
    <div>
      {isPremiumUser && (
        <button onClick={exportMonthlyReportAsPDF}>
          📄 月末PDFレポートを出力
        </button>
      )}
      {!isPremiumUser && (
        <p style={{ color: 'gray', fontStyle: 'italic' }}>
          📄 月末レポート出力はプレミアム機能です。
        </p>
      )}


      <h2>📊 グラフ・表</h2>

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
        <h4 style={{ marginBottom: "10px" }}>🏃‍♂️ 今週の運動率</h4>
        {exerciseRate && (
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
                name="運動率"
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
              fontWeight: 'bold'
            }}>
              🌡️ 基礎体温グラフ（1か月）
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
                    name="基礎体温（1か月）"
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  {avgMonthlyBasalTemp && (
                    <ReferenceLine
                      y={avgMonthlyBasalTemp}
                      stroke="orange"
                      strokeDasharray="4 4"
                      label={`平均: ${avgMonthlyBasalTemp.toFixed(2)}℃`}
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



        <CollapsibleExerciseGraphs data={oneMonthData} forceExpand={true} />


      </div>
    </div>
  );
};


export default GraphPage;
