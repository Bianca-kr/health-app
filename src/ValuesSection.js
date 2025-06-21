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

const ValueScale = ({ value, onChange }) => {
    // コメント定義（必要ならカスタマイズOK）
    const comments = {
        1: {
            ja: "今日はできなかった",
            en: "Couldn't follow today",
        },
        5: {
            ja: "今日は価値観通りに行動できた！",
            en: "You acted by your value today!",
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
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
            {(value.score === 1 || value.score === 5) && (
                <div style={{ marginLeft: 82, marginTop: 2 }}>
                    <span>
                        {comments[value.score].ja}
                        <br />
                        <span style={{ fontSize: 12, color: "gray" }}>
                            {comments[value.score].en}
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
};


export function ValuesSection({ form, setForm }) {
    const [valueOptions, setValueOptions] = useState(() => {
        const saved = localStorage.getItem("valueOptions");
        return saved ? JSON.parse(saved) : [];
    });
    const [newValue, setNewValue] = useState("");
    const values = form.values || [];

    // 候補から削除
    const handleDeleteValue = (value) => {
        const updated = valueOptions.filter(v => v !== value);
        setValueOptions(updated);
        localStorage.setItem("valueOptions", JSON.stringify(updated));
    };

    // 追加：候補＋今日のフォーム両方に
    const handleAddValue = () => {
        if (!newValue.trim()) return;
        // 候補リストに追加
        if (!valueOptions.includes(newValue)) {
            const updated = [...valueOptions, newValue];
            setValueOptions(updated);
            localStorage.setItem("valueOptions", JSON.stringify(updated));
        }
        // 今日のformにも追加
        if (!values.some(v => v.name === newValue)) {
            setForm({
                ...form,
                values: [...values, { name: newValue, score: undefined }]
            });
        }
        setNewValue("");
    };

    // バッジクリック → 今日のフォームに追加
    const handleBadgeClick = (val) => {
        if (!values.some(v => v.name === val)) {
            setForm({
                ...form,
                values: [...values, { name: val, score: undefined }]
            });
        }
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
                <div key={v.name} style={{ display: 'flex', alignItems: 'center' }}>
                    <ValueScale
                        value={v}
                        onChange={score => handleChangeScore(i, score)}
                    />
                    <button
                        onClick={() => {
                            if (window.confirm(`「${v.name}」を削除しますか？\nAre you sure you want to delete "${v.name}"?`)) {
                                const updated = values.filter((_, idx) => idx !== i);
                                setForm({ ...form, values: updated });
                            }
                        }}
                        style={{
                            marginLeft: 12,
                            background: 'transparent',
                            border: 'none',
                            color: '#d81b60',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1
                        }}
                        title="削除"
                    >×</button>
                </div>
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
