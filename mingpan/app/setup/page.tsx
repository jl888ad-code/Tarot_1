'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [pw, setPw]         = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [show, setShow]     = useState(false)

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (pw.length < 6) { setError('密碼至少需要 6 個字元'); return }
    if (pw !== confirm)  { setError('兩次密碼不一致'); return }

    setLoading(true)
    const res  = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup', password: pw, confirmPassword: confirm }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? '設定失敗'); return }
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Noto Serif TC', serif",
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>◈</div>
          <h1 style={{
            color: '#c9a84c',
            fontSize: '1.3rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            marginBottom: '8px',
          }}>
            命運星盤
          </h1>
          <p style={{ color: '#50483a', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
            初始化設定
          </p>
        </div>

        {/* 說明卡片 */}
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '10px',
          padding: '16px 18px',
          marginBottom: '24px',
          fontSize: '0.78rem',
          color: '#8a8070',
          lineHeight: '1.9',
        }}>
          👋 歡迎使用命運星盤！<br />
          這是您的第一次部署，請設定後台管理密碼。<br />
          <span style={{ color: '#c9a84c' }}>密碼儲存在 Vercel KV 資料庫，跨設備皆有效。</span>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSetup}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#8a8070',
              letterSpacing: '0.12em',
              marginBottom: '6px',
            }}>
              設定後台密碼
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="至少 6 個字元"
                required
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={eyeBtnStyle}
              >
                {show ? '隱藏' : '顯示'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.68rem',
              color: '#8a8070',
              letterSpacing: '0.12em',
              marginBottom: '6px',
            }}>
              確認密碼
            </label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="再次輸入密碼"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              color: '#e54444',
              fontSize: '0.78rem',
              marginBottom: '14px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? 'rgba(201,168,76,0.3)'
                : 'linear-gradient(135deg,#c9a84c,#8a6018)',
              border: 'none',
              borderRadius: '8px',
              color: '#050505',
              fontFamily: "'Noto Serif TC', serif",
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '設定中…' : '完 成 設 定'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d0d',
  border: '1px solid #272727',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#e8dcc8',
  fontFamily: "'Noto Serif TC', serif",
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: '#50483a',
  cursor: 'pointer',
  fontSize: '0.72rem',
  fontFamily: "'Noto Serif TC', serif",
}
