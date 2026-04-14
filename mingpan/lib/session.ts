/**
 * lib/session.ts
 * iron-session 設定
 * 使用 httpOnly cookie，密碼永遠不暴露給前端 JS
 */

import { SessionOptions } from 'iron-session'

export interface SessionData {
  isAdmin: boolean
}

export const SESSION_OPTIONS: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'fallback-secret-please-set-env-32chars!!',
  cookieName: 'mingpan_admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 天
  },
}
