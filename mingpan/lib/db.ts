/**
 * lib/db.ts
 * Vercel KV 工具函數
 *
 * KV 的 key 設計：
 *   admin:exists   → "1"          （是否已完成初始化）
 *   admin:password → bcrypt hash  （後台密碼雜湊）
 *   site:settings  → JSON string  （前台按鈕設定）
 *
 * 多租戶說明：
 *   每個客戶部署在自己的 Vercel 專案，連接自己的 KV 資料庫，
 *   key 完全隔離，不需要加 namespace。
 */

import { kv } from '@vercel/kv'

// ── 型別定義 ────────────────────────────────────────
export interface SiteSettings {
  btnText: string
  btnUrl:  string
  btnShow: boolean
}

// ── Admin 相關 ────────────────────────────────────────

/** 檢查是否已完成初始化（有沒有管理員密碼） */
export async function adminExists(): Promise<boolean> {
  const val = await kv.get<string>('admin:exists')
  return val === '1'
}

/** 儲存密碼雜湊（初始化 or 修改密碼時呼叫） */
export async function savePasswordHash(hash: string): Promise<void> {
  await kv.set('admin:password', hash)
  await kv.set('admin:exists', '1')
}

/** 取得密碼雜湊（用於 bcrypt.compare） */
export async function getPasswordHash(): Promise<string | null> {
  return await kv.get<string>('admin:password')
}

// ── 按鈕設定 ────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettings = {
  btnText: '開始轉運',
  btnUrl:  '',
  btnShow: true,
}

/** 取得前台按鈕設定（讀取失敗時回傳預設值） */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const raw = await kv.get<SiteSettings>('site:settings')
    return raw ?? DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** 儲存前台按鈕設定 */
export async function saveSettings(settings: SiteSettings): Promise<void> {
  await kv.set('site:settings', settings)
}
