import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '命運星盤 · 八字籤詩',
  description: '八字命盤 · 直接抽籤',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500;700;900&family=Cinzel+Decorative:wght@400;700&display=swap" rel="stylesheet" />
        <script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          charSet="utf-8"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
