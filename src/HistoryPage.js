import React, { useState, useMemo } from 'react';

const popColors = [
  "#ffe082", "#ffb1b1", "#b5e1ff", "#ffd59e",
  "#d3ffd1", "#f7b2ff", "#ffe4ad", "#bae7ff"
];


const HistoryPage = ({ data, handleEdit, handleDelete }) => {
  const [showMedicineSection, setShowMedicineSection] = React.useState(true);
  // 薬名を新しい順で抽出
  const allMedicines = useMemo(() => {
    const names = [];
    data.forEach(d => {
      ["medicineMorning", "medicineAfternoon", "medicineNight"].forEach(time => {
        (d[time] || []).forEach(med => {
          if (med.name && !names.includes(med.name)) {
            names.unshift(med.name); // 新しいものほど前へ
          }
        });
      });
    });
    return names;
  }, [data]);
  const [openTabs, setOpenTabs] = useState({});
  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  // カードの内容
  const renderMedicineTable = (medName, cardIdx) => (
    <div
      style={{
        borderRadius: 24,
        boxShadow: "0 4px 16px rgba(0,0,0,0.11)",
        background: popColors[cardIdx % popColors.length],
        padding: "16px 24px 8px 24px",
        margin: 0,
        marginBottom: "8px",
        transition: "all .2s",
        overflow: "auto",
        minWidth: 280
      }}
    >
      <table style={{
        width: "100%",
        background: "white",
        borderRadius: 16,
        borderCollapse: "separate",
        borderSpacing: 0,
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
        margin: 0
      }}>
        <thead>
          <tr style={{ background: "#faf9ef" }}>
            <th style={{ padding: 8, borderRadius: "16px 0 0 0" }}>日付</th>
            <th style={{ padding: 8 }}>朝</th>
            <th style={{ padding: 8 }}>昼</th>
            <th style={{ padding: 8, borderRadius: "0 16px 0 0" }}>夜</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((d, i) => {
            const getMark = (time) => {
              const found = (d[time] || []).find(med => med.name === medName);
              if (!found) return <span style={{ color: "#aaa" }}>-</span>;
              if (found.taken === "飲んだ") return <span style={{ color: "#3ec600", fontWeight: "bold" }}>〇</span>;
              if (found.taken === "飲まなかった") return <span style={{ color: "#ff5577", fontWeight: "bold" }}>×</span>;
              return <span style={{ color: "#aaa" }}>-</span>;
            };
            return (
              <tr key={i}>
                <td style={{ textAlign: "center", padding: 8 }}>{d.date}</td>
                <td style={{ textAlign: "center", padding: 8 }}>{getMark("medicineMorning")}</td>
                <td style={{ textAlign: "center", padding: 8 }}>{getMark("medicineAfternoon")}</td>
                <td style={{ textAlign: "center", padding: 8 }}>{getMark("medicineNight")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return <div>
    <h2>ここは過去の記録ページです / This is a page of past records</h2>
    
    <div style={{ marginBottom: "18px" }}>
      <button
        onClick={() => setShowMedicineSection(s => !s)}
        style={{
          background: "#0099ff", color: "#fff", border: "none", padding: "10px 20px",
          borderRadius: "12px", fontWeight: "bold", fontSize: "18px", cursor: "pointer"
        }}
      >
        {showMedicineSection ? "▼ 薬の記録を閉じる / Close Medication Record" : "▶ 薬の記録を開く / Open Medication Record"}
      </button>
    </div>
    {showMedicineSection && (
      <>
        {/* ▼▼▼ ポップな薬カード ▼▼▼ */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px 28px",
          marginBottom: 40,
          justifyContent: "flex-start"
        }}>
          {allMedicines.map((med, i) => (
            <div key={med}
              style={{
                flex: "0 1 380px",
                minWidth: 320,
                maxWidth: 420,
                margin: "0 0 12px 0"
              }}
            >
              <button
                style={{
                  background: "#1daaff",
                  color: "#fff",
                  padding: "12px 28px",
                  border: "none",
                  borderRadius: "24px 24px 0 0",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: openTabs[med] ? "0 6px 16px rgba(30,170,255,0.13)" : "none",
                  letterSpacing: "0.03em",
                  marginBottom: 0,
                  transition: ".2s"
                }}
                onClick={() => setOpenTabs(t => ({ ...t, [med]: !t[med] }))}
              >
                {openTabs[med] ? "▼" : "▶"} {med}
              </button>
              {openTabs[med] && renderMedicineTable(med, i)}
            </div>
          ))}
        </div>
        {/* ▲▲▲ ポップな薬カード ▲▲▲ */}
      </>
    )}

    <table border="1" cellPadding="4" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>
            日付
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Date</span>
          </th>
          <th>
            基礎体温
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Basal Temp</span>
          </th>
         
          <th>
            朝食
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Breakfast</span>
          </th>
          <th>
            昼食
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Lunch</span>
          </th>
          <th>
            夕食
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Dinner</span>
          </th>
          <th>
            行動
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Activity</span>
          </th>
          <th>
            運動
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Exercise</span>
          </th>
          <th>
            備考
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Note</span>
          </th>
          <th>
            操作
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Action</span>
          </th>

        </tr>
      </thead>
      <tbody>
        {data.sort((a, b) => new Date(b.date) - new Date(a.date)).map((d, i) => (
          <tr key={i}>
            <td>{d.date}（{d.dayOfWeek}）</td>
            <td>{d.basalTemp ?? '-'}</td>
            
            <td>{d.breakfast || '-'}</td>
            <td>{d.lunch || '-'}</td>
            <td>{d.dinner || '-'}</td>
            <td>{d.activity || '-'}</td>
            <td>
              {(Array.isArray(d.exerciseRecords) && d.exerciseRecords.length > 0 && d.exerciseRecords.some(r => r.name && r.name.trim() !== ""))
                ? d.exerciseRecords
                  .filter(r => r.name && r.name.trim() !== "")
                  .map((r, idx) => `${r.name} ${r.count}${r.unit}`).join(', ')
                : '-'}
            </td>
            <td>{d.note || '-'}</td>
            <td>
              <button onClick={() => handleEdit(d.date)}
                style={{ padding: "4px 8px", marginRight: "6px", lineHeight: "1.2" }}>

                編集
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>edit</span>
              </button>
              <button onClick={() => handleDelete(d.date)}
                style={{ padding: "4px 8px", marginRight: "6px", lineHeight: "1.2" }}>
                削除
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>delete</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
};

export default HistoryPage;
