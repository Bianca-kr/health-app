<div style={{
  backgroundColor: '#e0f7fa',  // 薄水色
  borderRadius: '16px',
  padding: '20px',
  marginTop: '24px',
  boxShadow: '0 4px 12px rgba(0, 150, 200, 0.2)',
  fontFamily: 'sans-serif'
}}>

  <div style={sectionStyle}>
    <button type="button" onClick={() => setShowBloodPressure(!showBloodPressure)}>
      {showBloodPressure ? '▼ 血圧を閉じる' : '▶ 血圧を表示'}
    </button>
    {showBloodPressure && (
      <fieldset>
        <legend style={legendStyle}>血圧</legend>
        {["朝", "昼", "夜"].map((time, idx) => (
          <div key={idx}>
            {time}:
            <input style={inputStyle} name={`bp${time}High`} type="number" placeholder="上" value={form[`bp${time}High`]} onChange={handleChange} />
            <input style={inputStyle} name={`bp${time}Low`} type="number" placeholder="下" value={form[`bp${time}Low`]} onChange={handleChange} />
          </div>
        ))}
      </fieldset>
    )}
  </div>

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
        🌡️ 血圧グラフ
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
            <Line type="monotone" dataKey="bpMorningHigh" stroke="#0000ff" name="朝 上" />
            <Line type="monotone" dataKey="bpMorningLow" stroke="#00ff00" name="朝 下" />
            <Line type="monotone" dataKey="bpAfternoonHigh" stroke="#ff00ff" name="昼 上" />
            <Line type="monotone" dataKey="bpAfternoonLow" stroke="#ff8800" name="昼 下" />
            <Line type="monotone" dataKey="bpNightHigh" stroke="#880000" name="夜 上" />
            <Line type="monotone" dataKey="bpNightLow" stroke="#008888" name="夜 下" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )}
  {isPremiumUser && (
    <button onClick={exportMonthlyReportAsPDF}>
      📄 月末PDFレポートを出力
    </button>
  )}
  {!isPremiumUser && (
    <p style={{ color: 'gray', fontStyle: 'italic' }}>
      📄 レポート出力はプレミアム機能です。
    </p>
  )}
  <div id="monthly-report">
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
          🌡️ 血圧グラフ
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
              <Line type="monotone" dataKey="bpMorningHigh" stroke="#0000ff" name="朝 上" />
              <Line type="monotone" dataKey="bpMorningLow" stroke="#00ff00" name="朝 下" />
              <Line type="monotone" dataKey="bpAfternoonHigh" stroke="#ff00ff" name="昼 上" />
              <Line type="monotone" dataKey="bpAfternoonLow" stroke="#ff8800" name="昼 下" />
              <Line type="monotone" dataKey="bpNightHigh" stroke="#880000" name="夜 上" />
              <Line type="monotone" dataKey="bpNightLow" stroke="#008888" name="夜 下" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}

  </div>

  <h3 style={{ color: '#007c91', marginBottom: '10px' }}>📊 表示設定</h3>

  <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <button
      onClick={() => setViewRange("1week")}
      style={{
        backgroundColor: '#b3e5fc',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#004d60'
      }}
    >
      1週間
    </button>

    <button
      onClick={() => setViewRange("1month")}
      style={{
        backgroundColor: '#b3e5fc',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#004d60'
      }}
    >
      1か月
    </button>

    <button
      onClick={downloadCSV}
      style={{
        backgroundColor: '#b2ebf2',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#006064'
      }}
    >
      CSVダウンロード
    </button>
  </div>
</div>

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
  medicineMorning: [{ id: uuidv4(), name: '', taken: '' }],
  medicineAfternoon: [{ id: uuidv4(), name: '', taken: '' }],
  medicineNight: [{ id: uuidv4(), name: '', taken: '' }],
  activity: '',
  exercise: '',
  note: '',
  sleepTime: '',
  exerciseRecords: [{ id: uuidv4(), name: "", count: "", unit: "回" }]
};


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
<button type="button" style={{ ...inputStyle, backgroundColor: '#ccc' }}>保存 / Preservation</button>

import React, { useState } from 'react';

const sectionStyle = {
  backgroundColor: '#f4f0fa',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '24px',
  boxShadow: '0 4px 12px rgba(150, 100, 255, 0.2)',
  fontFamily: 'sans-serif'
};

const legendStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#6c4d9c',
  marginBottom: '12px'
};

const ValueScale = ({ value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
    <span style={{ minWidth: 80 }}>{value.name}</span>
    <div style={{ display: "flex", marginLeft: 12 }}>
      {[1, 2, 3, 4, 5].map((num) => (
        <label key={num} style={{ margin: "0 8px" }}>
          <input
            type="radio"
            name={`value-${value.name}`}
            value={num}
            checked={value.score === num}
            onChange={() => onChange(num)}
          />
          <span style={{ marginLeft: 2 }}>{num}</span>
        </label>
      ))}
    </div>
  </div>
);

export function ValuesSection({ form, setForm }) {
  const [newValue, setNewValue] = useState("");
  const values = form.values || [];

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    if (values.some(v => v.name === newValue)) return;
    setForm({
      ...form,
      values: [...values, { name: newValue, score: undefined }]
    });
    setNewValue("");
  };

  const handleChangeScore = (idx, score) => {
    const updated = values.map((v, i) =>
      i === idx ? { ...v, score } : v
    );
    setForm({ ...form, values: updated });
  };

  return (
    <div style={sectionStyle}>
      <label style={legendStyle}>
        🧭 価値観と実践度
        <br />
        <span style={{ fontSize: "12px", color: "gray" }}>
          Your values & today's action
        </span>
      </label>

      {values.map((v, i) => (
        <ValueScale
          key={v.name}
          value={v}
          onChange={score => handleChangeScore(i, score)}
        />
      ))}
      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder=" 新しい価値観を入力 / Enter your new values"
          style={{ flex: 1, marginRight: 8, borderRadius: 8, padding: "6px 8px", border: "1px solid #bbb" }}
        />
        <button type="button" onClick={handleAddValue} style={{
          backgroundColor: "#d1c4e9", color: "#4a148c", border: "none", borderRadius: 8,
          padding: "6px 16px", fontWeight: "bold", cursor: "pointer"
        }}>＋追加</button>
      </div>
    </div>
  );
}

{
  Array.isArray(filterByRange()) && (
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
        fontWeight: 'bold',
        lineHeight: '1.4'
      }}>
        🌡️ 血糖値グラフ
        <br />
        <span style={{ fontSize: '12px', color: 'gray' }}>
          Blood Sugar Graph
        </span>
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
            <Line type="monotone" dataKey="bloodSugarMorning" stroke="#82ca9d" name="（朝）/ (morning)" />
            <Line type="monotone" dataKey="bloodSugarAfternoon" stroke="#ff7300" name="（昼）/ (Afternoon)" />
            <Line type="monotone" dataKey="bloodSugarNight" stroke="#ff0000" name="（夜）/ (Night)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
{
  Array.isArray(thisWeekData) && (
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
        fontWeight: 'bold',
        lineHeight: '1.4'
      }}>

        🌡️ 基礎体温グラフ
        <br />
        <span style={{ fontSize: '12px', color: 'gray' }}>
          Basal Temperature
        </span>
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
              name="基礎体温（今週）/ Basal Temp (The Past Week)"
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />

            {/* 🔁 平均ライン */}
            {avgBasalTemp && (
              <ReferenceLine
                y={avgBasalTemp}
                stroke="orange"
                strokeDasharray="4 4"
                label={`平均 averrage: ${avgBasalTemp.toFixed(2)}℃`}
              />
            )}

            {/* 🔁 比較用：先週の線（赤） */}
            {compareWithLastWeek && (
              <Line
                type="monotone"
                data={lastWeekData}
                dataKey="basalTemp"
                stroke="#ff4d4f"
                name="基礎体温（先週）/ Basal Temp (Last Week)"
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>

        </ResponsiveContainer>
      </div>
    </div>
  )
}
