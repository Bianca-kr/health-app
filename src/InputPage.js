// src/InputPage.js

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ValuesSection } from './ValuesSection'; // or 同ファイルなら省略


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

const inputStyle = {
  marginBottom: '10px',
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  width: '100%'
};


const InputPage = ({
  form,
  setForm,
  handleChange,
  handleSubmit,
  handleAddMedicine,
  handleMedicineChange,
  medicineOptions,
  newMedicine,
  setNewMedicine,
  handleMedicineOptionAdd,
  newExercise,
  setNewExercise,
  exerciseOptions,
  setExerciseOptions,
  editingIndex
}) => {
  const [showBloodSugar, setShowBloodSugar] = useState(false);

 




  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={sectionStyle}>
          <label style={legendStyle}>
            📅 日付と起床時間
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              Date & Wake-up Time
            </span>
          </label>
          <br />
          <label
            style={{
              color: '6a1b9a',
              fontFamily: "'Rounded Mplus 1c', 'Arial Rounded MT Bold', sans-serif", // 丸っこい印象のフォント
              fontSize: '15px',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '4px 10px',
            }}
          >
            日付 / Date:

          </label>
          <input style={inputStyle} name="date" type="date" value={form.date} onChange={handleChange} />
          <label style={{
            color: '6a1b9a',               // 濃い紫（例: パープル系）
            fontFamily: "'Rounded Mplus 1c', 'Arial Rounded MT Bold', sans-serif", // 丸っこい印象のフォント
            fontSize: '15px',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '4px 10px',
          }}
          >
            起床時間 / Wake-up Time:

          </label>
          <input style={inputStyle} name="wakeTime" type="time" value={form.wakeTime} onChange={handleChange} />
          <input style={inputStyle} name="basalTemp" type="number" step="0.01" placeholder="基礎体温  basal temp" value={form.basalTemp} onChange={handleChange} />
        </div>

        <div style={sectionStyle}>
          <button type="button" onClick={() => setShowBloodSugar(!showBloodSugar)}
            style={{
              backgroundColor: '#e0d4f7',  // ← 今より濃いラベンダー色（例：#f6f2fcより濃い）
              border: '2px solid #b39ddb',
              color: '#4a148c',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              boxShadow: '0 4px 8px rgba(150, 100, 200, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              lineHeight: '1.6'
            }}
          >
            {showBloodSugar ? (
              <>
                ▼ 血糖値を閉じる
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>Hide Blood Sugar</span>
              </>
            ) : (
              <>
                ▶ 血糖値を表示
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>Show Blood Sugar</span>
              </>
            )}
          </button>

          {showBloodSugar && (
            <fieldset>
              <legend style={legendStyle}>
                血糖値
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>Blood Sugar</span>
              </legend>
              <input style={inputStyle} name="bloodSugarMorning" type="number" placeholder="朝" value={form.bloodSugarMorning} onChange={handleChange} />
              <input style={inputStyle} name="bloodSugarAfternoon" type="number" placeholder="昼" value={form.bloodSugarAfternoon} onChange={handleChange} />
              <input style={inputStyle} name="bloodSugarNight" type="number" placeholder="夜" value={form.bloodSugarNight} onChange={handleChange} />
            </fieldset>
          )}
        </div>



        <div style={sectionStyle}>
          <legend style={legendStyle}>
            🍽 食事
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Meals</span>
          </legend>
          {[
            { key: "breakfast", label: "朝食" },
            { key: "snackMorning", label: "間食（朝）" },
            { key: "lunch", label: "昼食" },
            { key: "snackAfternoon", label: "間食（午後）" },
            { key: "dinner", label: "夕食" },
            { key: "snackNight", label: "間食（夜）" }
          ].map(({ key, label }, i) => (
            <input
              key={i}
              style={inputStyle}
              name={key}
              placeholder={`${label} / ${key}`}
              value={form[key]}
              onChange={handleChange}
            />
          ))}

        </div>

        <div style={sectionStyle}>
          <legend style={legendStyle}>
            💊 薬の記録
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Medication Record</span>
          </legend>
          {["medicineMorning", "medicineAfternoon", "medicineNight"].map((time) => (
            <div key={time}>
              <strong>
                {time.includes("Morning") && (
                  <>
                    朝
                    <br />
                    <span style={{ fontSize: "12px", color: "gray" }}>Morning</span>
                  </>
                )}
                {time.includes("Afternoon") && (
                  <>
                    昼
                    <br />
                    <span style={{ fontSize: "12px", color: "gray" }}>Afternoon</span>
                  </>
                )}
                {time.includes("Night") && (
                  <>
                    夜
                    <br />
                    <span style={{ fontSize: "12px", color: "gray" }}>Night</span>
                  </>
                )}
              </strong>

              {form[time]?.map((med, idx) => (
                <div key={med.id} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                  <select style={inputStyle} value={med.name} onChange={(e) => handleMedicineChange(time, idx, 'name', e.target.value)}>
                    <option value="">薬を選択 / Select Medication</option>
                    {medicineOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  </select>
                  <select style={inputStyle} value={med.taken} onChange={(e) => handleMedicineChange(time, idx, 'taken', e.target.value)}>
                    <option value="">服用状況 / dosage status</option>
                    <option value="飲んだ">飲んだ / taken</option>
                    <option value="飲まなかった">飲まなかった / missed</option>
                  </select>
                </div>
              ))}
              <button type="button" onClick={() => handleAddMedicine(time)}
                style={{
                  backgroundColor: '#e0d4f7',  // ← 今より濃いラベンダー色（例：#f6f2fcより濃い）
                  border: '2px solid #b39ddb',
                  color: '#4a148c',
                  borderRadius: '10px',
                  padding: '3px 6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  fontFamily: 'sans-serif',
                  boxShadow: '0 4px 8px rgba(150, 100, 200, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  lineHeight: '1.6'
                }}>＋追加
                <br />
                <span style={{ fontSize: "12px", color: "gray" }}>
                  Add
                </span>
              </button>
              <div style={{ height: "18px" }} /> {/* ← ここが空行 */}
            </div>
          ))}
          <div style={{ height: "40px" }} /> {/* ← ここが空行 */}
          <input style={inputStyle} value={newMedicine} onChange={(e) => setNewMedicine(e.target.value)} placeholder="新しい薬の名前 / New Medication" />
          <button type="button" onClick={handleMedicineOptionAdd} style={{
            backgroundColor: '#e0d4f7',  // ← 今より濃いラベンダー色（例：#f6f2fcより濃い）
            border: '2px solid #b39ddb',
            color: '#4a148c',
            borderRadius: '10px',
            padding: '6px 10px',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            boxShadow: '0 4px 8px rgba(150, 100, 200, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            lineHeight: '1.6'
          }}
          >
            薬を登録
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              Register Medication
            </span>
          </button>
        </div>

        <div style={sectionStyle}>
          <legend style={legendStyle}>
            🏃‍♂️ 行動と運動
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Activity & Exercise</span>
          </legend>
          <input style={inputStyle} name="activity" placeholder="行動記録 / Activity record" value={form.activity} onChange={handleChange} />
          <div style={{ height: "40px" }} /> {/* ← ここが空行 */}
          <h4>運動記録 / Exercise record</h4>

          {form.exerciseRecords?.map((rec, i) => (
            <div key={rec.id} style={{ marginBottom: "5px", display: "flex", gap: "8px", alignItems: "center" }}>
              <select style={inputStyle} value={rec.name} onChange={(e) => {
                const updated = [...form.exerciseRecords];
                updated[i].name = e.target.value;
                setForm({ ...form, exerciseRecords: updated });
              }}>
                <option value="">運動を選択 / Select Exerrcise

                </option>
                {exerciseOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
              </select>
              <input style={{ ...inputStyle, width: '60px' }} type="number" placeholder="数/num" value={rec.count} onChange={(e) => {
                const updated = [...form.exerciseRecords];
                updated[i].count = e.target.value;
                setForm({ ...form, exerciseRecords: updated });
              }} />
              <select style={inputStyle} value={rec.unit} onChange={(e) => {
                const updated = [...form.exerciseRecords];
                updated[i].unit = e.target.value;
                setForm({ ...form, exerciseRecords: updated });
              }}>
                <option value="回">回 / time</option>
                <option value="分">分 /min</option>
                <option value="km">km</option>
                <option value="セット">セット /set</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={() => {
            setForm({
              ...form,
              exerciseRecords: [...form.exerciseRecords, { id: uuidv4(), name: "", count: "", unit: "回" }]
            });
          }}
            style={{
              backgroundColor: '#e0d4f7',  // ← 今より濃いラベンダー色（例：#f6f2fcより濃い）
              border: '2px solid #b39ddb',
              color: '#4a148c',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              boxShadow: '0 4px 8px rgba(150, 100, 200, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              lineHeight: '1.6'
            }}
          >
            ＋運動記録を追加
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              Add exercise records
            </span>
          </button>
          <div style={{ height: "40px" }} /> {/* ← ここが空行 */}
          <input style={inputStyle} type="text" placeholder="新しい運動名 / New Exercise" value={newExercise} onChange={(e) => setNewExercise(e.target.value)} />
          <button type="button" onClick={() => {
            if (newExercise && !exerciseOptions.includes(newExercise)) {
              const updated = [...exerciseOptions, newExercise];
              setExerciseOptions([...exerciseOptions, newExercise]);
              setNewExercise("");
              localStorage.setItem("exerciseOptions", JSON.stringify(updated));
            }
          }}
            style={{
              backgroundColor: '#e0d4f7',  // ← 今より濃いラベンダー色（例：#f6f2fcより濃い）
              border: '2px solid #b39ddb',
              color: '#4a148c',
              borderRadius: '10px',
              padding: '6px 10px',
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              boxShadow: '0 4px 8px rgba(150, 100, 200, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              lineHeight: '1.6'
            }}>
            運動を登録
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              Register Exercise
            </span>
          </button>
        </div>

        <ValuesSection form={form} setForm={setForm} />

        <div style={sectionStyle}>
          <legend style={legendStyle}>
            📝 備考・🛌 就寝時間
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>
              Notes & Bedtime
            </span>
          </legend>

          <input style={inputStyle} name="note" placeholder="備考 / Notes" value={form.note} onChange={handleChange} />
          <label
            style={{
              color: '6a1b9a',               // 濃い紫（例: パープル系）
              fontFamily: "'Rounded Mplus 1c', 'Arial Rounded MT Bold', sans-serif", // 丸っこい印象のフォント
              fontSize: '15px',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '4px 10px',
            }}
          >就寝時間 / Bedtime:

          </label>
          <input style={inputStyle} name="sleepTime" type="time" value={form.sleepTime} onChange={handleChange} />
        </div>

        <button type="submit" style={{ ...inputStyle, backgroundColor: '#a087c1', color: '#fff', fontWeight: 'bold' }}>{editingIndex ? "更新 / Update" : "追加 / Add"}</button>
      </form>

    </div>
  );
};

export default InputPage;
