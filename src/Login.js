// Login.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // ログイン後にApp.jsへ知らせる
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      maxWidth: 360,
      margin: '80px auto',
      padding: 20,
      border: '1px solid #ccc',
      borderRadius: 10,
      background: '#fefefe'
    }}>
      <h2>{isLoginMode ? 'ログイン' : '新規登録'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10 }}>
          {isLoginMode ? 'ログイン' : '登録'}
        </button>
      </form>

      <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: 10 }}>
        {isLoginMode ? 'アカウントを作成する' : 'ログインに切り替え'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
