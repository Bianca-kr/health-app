// Profile.js
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { toast } from 'react-toastify';

function Profile() {
  const user = auth.currentUser;
  const [nickname, setNickname] = useState('');
  //const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const ref = doc(db, "users", user.uid);
      getDoc(ref).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.nickname || '');
          //setPhotoUrl(data.photoUrl || '');
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error("ニックネームを入力してください。\nPlease enter your nickname.");
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { nickname }, { merge: true });
      toast.success("保存しました！\nNickname saved!");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      await sendPasswordResetEmail(auth, user.email);
       toast.success("パスワード再設定メールを送信しました！\nPassword reset email sent!");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("本当にアカウントを削除しますか？ \nDo you really want to delete your account?")) {
      await deleteUser(user);
      toast.success("アカウントを削除しました\nAccount deleted");
    }
  };

  return (
    <div style={{
      padding: 30,
      maxWidth: 500,
      margin: "0 auto",
      background: "#f9f9f9",
      borderRadius: 12,
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>プロフィール設定 / Profile Settings</h2>

      <div style={{ marginBottom: 15 }}>
        <label>ニックネーム / Nickname：</label><br />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
        />
      </div>

      
      

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%", padding: 10, marginBottom: 15,
          background: "#4CAF50", color: "#fff", border: "none",
          borderRadius: 6, fontWeight: "bold", cursor: "pointer"
        }}
      >
        {saving ? "保存中… / being saved " : "保存 / Save"}
      </button>

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={handleResetPassword}
        style={{
          width: "100%", padding: 10, marginBottom: 10,
          background: "#2196F3", color: "#fff", border: "none",
          borderRadius: 6, cursor: "pointer"
        }}
      >
         パスワード再設定メールを送信 / Send password reset email
      </button>

      <button
        onClick={handleDeleteAccount}
        style={{
          width: "100%", padding: 10,
          background: "#f44336", color: "#fff", border: "none",
          borderRadius: 6, cursor: "pointer"
        }}
      >
        アカウント削除 / Delate Account
      </button>
    </div>
  );
}

export default Profile;
