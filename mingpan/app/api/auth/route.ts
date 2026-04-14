/**
 * app/api/auth/route.ts
 *
 * GET    /api/auth                   → 查詢登入狀態 & 初始化狀態
 * POST   /api/auth                   → 登入
 * POST   /api/auth { action:'setup'} → 首次初始化設定密碼
 * DELETE /api/auth                   → 登出
 * PUT    /api/auth                   → 修改密碼（需已登入）
 *
 * ── 防暴力破解 ────────────────────────────────────────────
 * KV key: rate:login:<ip>
 * TTL: 15 分鐘，失敗 10 次封鎖，成功後重置
 * ─────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession }            from 'iron-session'
import bcrypt                        from 'bcryptjs'
import { cookies }                   from 'next/headers'
import { kv }                        from '@vercel/kv'
import { adminExists, getPasswordHash, savePasswordHash } from '@/lib/db'
import { SESSION_OPTIONS, SessionData }                   from '@/lib/session'

const MAX_ATTEMPTS = 10
const WINDOW_SEC   = 60 * 15   // 15 分鐘

// ── Rate limit helpers ────────────────────────────────────

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

async function getFailCount(ip: string): Promise<number> {
  try { return (await kv.get<number>(`rate:login:${ip}`)) ?? 0 }
  catch { return 0 }
}

async function incrementFail(ip: string): Promise<number> {
  try {
    const key   = `rate:login:${ip}`
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, WINDOW_SEC)
    return count
  } catch { return 1 }
}

async function resetFail(ip: string): Promise<void> {
  try { await kv.del(`rate:login:${ip}`) } catch {}
}

// ── GET：查詢狀態 ─────────────────────────────────────────
export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)
  const exists  = await adminExists()
  return NextResponse.json({ isAdmin: session.isAdmin === true, hasSetup: exists })
}

// ── POST：登入 or 初始化 ──────────────────────────────────
export async function POST(req: NextRequest) {
  const ip   = getClientIP(req)
  const body = await req.json() as {
    action?: string; password?: string; confirmPassword?: string
  }

  // ── Setup（首次） ──────────────────────────────────────
  if (body.action === 'setup') {
    if (await adminExists())
      return NextResponse.json({ error: '已完成初始化，請直接登入' }, { status: 400 })
    if (!body.password || body.password.length < 6)
      return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 })
    if (body.password !== body.confirmPassword)
      return NextResponse.json({ error: '兩次密碼不一致' }, { status: 400 })

    await savePasswordHash(await bcrypt.hash(body.password, 12))
    const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)
    session.isAdmin = true
    await session.save()
    await resetFail(ip)
    return NextResponse.json({ ok: true })
  }

  // ── Login ──────────────────────────────────────────────
  if (!await adminExists())
    return NextResponse.json({ error: '尚未初始化，請先前往 /setup' }, { status: 400 })

  // 防暴力：封鎖檢查
  const failCount = await getFailCount(ip)
  if (failCount >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: '登入失敗次數過多，請 15 分鐘後再試', retryAfter: WINDOW_SEC },
      { status: 429, headers: { 'Retry-After': String(WINDOW_SEC) } }
    )
  }

  if (!body.password)
    return NextResponse.json({ error: '請輸入密碼' }, { status: 400 })

  const hash = await getPasswordHash()
  if (!hash)
    return NextResponse.json({ error: '系統錯誤，請重新部署' }, { status: 500 })

  const match = await bcrypt.compare(body.password, hash)

  if (!match) {
    const newCount  = await incrementFail(ip)
    const remaining = Math.max(0, MAX_ATTEMPTS - newCount)
    const errMsg    = remaining > 0
      ? `密碼錯誤，還剩 ${remaining} 次機會`
      : '登入失敗次數過多，請 15 分鐘後再試'
    return NextResponse.json({ error: errMsg, attemptsLeft: remaining }, { status: 401 })
  }

  // 成功：重置計數，建立 session
  await resetFail(ip)
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)
  session.isAdmin = true
  await session.save()
  return NextResponse.json({ ok: true })
}

// ── DELETE：登出 ───────────────────────────────────────────
export async function DELETE() {
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)
  session.destroy()
  return NextResponse.json({ ok: true })
}

// ── PUT：修改密碼 ──────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)
  if (!session.isAdmin)
    return NextResponse.json({ error: '未登入' }, { status: 401 })

  const { currentPassword, newPassword, confirmPassword } = await req.json() as {
    currentPassword?: string; newPassword?: string; confirmPassword?: string
  }

  if (!currentPassword || !newPassword || !confirmPassword)
    return NextResponse.json({ error: '請填寫所有欄位' }, { status: 400 })
  if (newPassword.length < 6)
    return NextResponse.json({ error: '新密碼至少需要 6 個字元' }, { status: 400 })
  if (newPassword !== confirmPassword)
    return NextResponse.json({ error: '兩次密碼不一致' }, { status: 400 })

  const hash = await getPasswordHash()
  if (!hash)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })

  if (!await bcrypt.compare(currentPassword, hash))
    return NextResponse.json({ error: '目前密碼錯誤' }, { status: 401 })

  await savePasswordHash(await bcrypt.hash(newPassword, 12))
  return NextResponse.json({ ok: true })
}
