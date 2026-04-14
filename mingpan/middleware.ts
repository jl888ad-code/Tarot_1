/**
 * middleware.ts
 *
 * 優化版：直接讀 Vercel KV 判斷初始化狀態，省掉一次 /api/auth 往返。
 * Vercel KV 底層是 fetch，在 Edge Runtime 完全支援。
 *
 * 路由規則：
 *   - 未初始化 + 非 /setup → redirect /setup
 *   - 已初始化 + /setup   → redirect /
 *   - 其餘一律放行
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 略過靜態資源、_next、API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  let hasSetup = false
  try {
    const val = await kv.get<string>('admin:exists')
    hasSetup  = val === '1'
  } catch {
    // KV 尚未設定（本地開發無 KV）：直接放行，讓頁面自行處理
    return NextResponse.next()
  }

  const isSetupPage = pathname === '/setup'

  if (!hasSetup && !isSetupPage) {
    return NextResponse.redirect(new URL('/setup', req.url))
  }
  if (hasSetup && isSetupPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
