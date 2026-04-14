/**
 * app/api/settings/route.ts
 *
 * GET  /api/settings → 公開讀取前台按鈕設定（任何人都能讀）
 * POST /api/settings → 更新設定（需登入）
 */

import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getSettings, saveSettings, SiteSettings } from '@/lib/db'
import { SESSION_OPTIONS, SessionData } from '@/lib/session'

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    SESSION_OPTIONS
  )
  if (!session.isAdmin) {
    return NextResponse.json({ error: '未登入' }, { status: 401 })
  }

  const body = await req.json() as Partial<SiteSettings>
  const current = await getSettings()

  const updated: SiteSettings = {
    btnText: typeof body.btnText === 'string' ? body.btnText.trim() || '開始轉運' : current.btnText,
    btnUrl:  typeof body.btnUrl  === 'string' ? body.btnUrl.trim()  : current.btnUrl,
    btnShow: typeof body.btnShow === 'boolean' ? body.btnShow : current.btnShow,
  }

  await saveSettings(updated)
  return NextResponse.json({ ok: true, settings: updated })
}
