# 命運星盤 · Vercel 部署說明

## 客戶需要做的 5 個步驟

---

### Step 1：上傳程式碼到 GitHub

1. 前往 [github.com](https://github.com) 建立帳號（免費）
2. 點「New repository」→ 名稱隨意（例：`mingpan`）→ 選 Private → Create
3. 把本資料夾的所有檔案上傳到這個 repo（可以直接拖曳）

---

### Step 2：連結 Vercel

1. 前往 [vercel.com](https://vercel.com) → 用 GitHub 帳號登入
2. 點「Add New Project」→ 選剛才的 GitHub repo → Import
3. Framework Preset 選 **Next.js**（通常自動偵測）
4. 先**不要**按 Deploy，繼續 Step 3

---

### Step 3：開通 Vercel KV 資料庫

> **這是最重要的一步，密碼就存在這裡**

1. 在 Vercel 後台左側選單點 **Storage**
2. 點「Create Database」→ 選 **KV**
3. 資料庫名稱隨意（例：`mingpan-kv`）→ Region 選距離最近的
4. 點「Connect to Project」→ 選你的 mingpan 專案 → Connect
5. Vercel 會**自動把環境變數填入**你的專案（`KV_URL` 等）

---

### Step 4：設定 Session 金鑰

1. 在 Vercel 後台 → 你的專案 → **Settings** → **Environment Variables**
2. 新增一個變數：
   - Name: `SESSION_SECRET`
   - Value: 輸入任意 32 字元以上的隨機字串（例：`my-super-secret-key-change-this-2024!!`）
3. 點 Save

---

### Step 5：部署！

1. 回到 Vercel 專案 → **Deployments** → 點「Redeploy」（或 Push 到 GitHub）
2. 等待 1-2 分鐘完成部署
3. 開啟你的網址（`xxx.vercel.app`）
4. 第一次開啟會**自動跳轉到 `/setup`** 頁面
5. 設定你的後台密碼 → 完成！

---

## 之後要改密碼怎麼做？

1. 開啟你的網站
2. 點右下角齒輪 ⚙
3. 輸入目前密碼登入
4. 點「修改密碼」頁籤
5. 輸入目前密碼 + 新密碼 → 確認修改

**密碼存在 Vercel KV，任何設備登入都有效。**

---

## 常見問題

**Q：換了設備/瀏覽器，要重新輸入密碼嗎？**
A：需要輸入密碼，但密碼是統一的（存在 Vercel KV），不是以前的 localStorage 版本。

**Q：忘記密碼怎麼辦？**
A：前往 Vercel 後台 → Storage → KV → 找到 `admin:password` → 刪除這個 key → 重新整理網站 → 會自動跳回 /setup 重新設定密碼。

**Q：要綁定自己的網域嗎？**
A：可選。Vercel 後台 → Settings → Domains → 輸入你的網域 → 依指示設定 DNS。

---

## 專案結構說明

```
mingpan/
├── app/
│   ├── page.tsx          # 主頁面（八字命盤 + 抽籤）
│   ├── setup/page.tsx    # 第一次初始化設定密碼
│   ├── api/
│   │   ├── auth/route.ts     # 後端登入/登出/改密碼 API
│   │   └── settings/route.ts # 按鈕設定 API
│   ├── layout.tsx
│   └── globals.css       # 原始樣式（完整保留）
├── lib/
│   ├── db.ts             # Vercel KV 工具函數
│   └── session.ts        # iron-session 設定
├── middleware.ts          # 自動偵測初始化狀態
└── .env.local.example    # 環境變數範本
```
