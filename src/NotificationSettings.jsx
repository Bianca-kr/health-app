import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

const TYPES = ["薬 Medication", "運動 Exercise", "食事 Meal", "その他 Other"];
const WEEKDAYS = ["日 Sun", "月 Mon", "火 Tue", "水 Wed", "木 Thu", "金 Fri", "土 Sat"];

function NotificationSettings() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications_v4");
    return saved ? JSON.parse(saved) : [];
  });
  const [type, setType] = useState("薬");
  const [time, setTime] = useState("");
  const [weekdays, setWeekdays] = useState([]);

  // 通知データを保存
  useEffect(() => {
    localStorage.setItem("notifications_v4", JSON.stringify(notifications));
  }, [notifications]);

  // 毎分通知チェック
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
      const currentDay = now.getDay(); // 0(日)〜6(土)

      notifications.forEach(n => {
        if (n.time === currentTime && n.weekdays.includes(currentDay)) {
          showNotification(
            `[通知] ${n.type}`,
            `設定した時間 ${n.time} になりました。\nIt's time for your scheduled ${n.type} at ${n.time}.`
          );
        }

      });
    }, 60 * 1000); // 1分ごと

    return () => clearInterval(interval);
  }, [notifications]);

  // 通知を表示
  const showNotification = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => {
        if (p === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  const handleAdd = () => {
    if (!time || weekdays.length === 0) {
      alert("時間と曜日を選択してください (Prease select time and weekdays).");
      return;
    }

    setNotifications([
      { id: uuidv4(), type, time, weekdays },
      ...notifications
    ]);
    setTime(""); setWeekdays([]);
  };

  const handleWeekdayToggle = idx => {
    setWeekdays(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  const handleDelete = id => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div style={{
      background: "#f8fff8",
      border: "2px solid #47c072",
      borderRadius: "16px",
      padding: "24px",
      margin: "20px 0"
    }}>
      <h3>🔔 通知設定 / Notification settings</h3>

      <div style={{ marginBottom: 16 }}>
        {/* 種類（Type） */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "inline-block", lineHeight: "1.4" }}>
            種類：
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Type</span>
          </label>
          <br />
          <select value={type} onChange={e => setType(e.target.value)} style={{ marginTop: 4 }}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 時間（Time） */}
        <div>
          <label style={{ display: "inline-block", lineHeight: "1.4" }}>
            時間：
            <br />
            <span style={{ fontSize: "12px", color: "gray" }}>Time</span>
          </label>
          <br />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ marginTop: 4 }} />
        </div>
      </div>



      <div style={{ marginBottom: 16 }}>
        曜日：
        <br />
        <span style={{ fontSize: "12px", color: "gray" }}>Weekdays</span>
        {WEEKDAYS.map((w, idx) => (
          <label key={w} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={weekdays.includes(idx)}
              onChange={() => handleWeekdayToggle(idx)}
            />{w}
          </label>
        ))}
      </div>

      <button onClick={handleAdd}>登録 / Registration</button>
      <p style={{ fontSize: "12px", color: "#666" }}>
        ※通知はブラウザを開いている間のみ有効です。
        <br />
        Notifications are valid only while the browser is open.
      </p>


      <hr style={{ margin: "20px 0" }} />
      <h4>登録済み通知 / Registered Notifications</h4>
      <ul>
        {notifications.map((n, i) => (
          <li key={n.id} style={{ marginBottom: 10 }}>
            [{n.type}] {n.time}
            {n.weekdays.map(i => WEEKDAYS[i]).join("・")}
            <button onClick={() => handleDelete(n.id)} style={{
              marginLeft: 10,
              background: "#ffecec",
              border: "none",
              borderRadius: 6,
              padding: "2px 8px",
              color: "#b22222"
            }}>削除 / Deletion</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationSettings;
