'use client'

/**
 * app/page.tsx
 * 命運星盤主頁面
 * 八字計算/抽籤邏輯保留原始 JS，後台密碼驗證由 /api/auth 處理
 */

import { useEffect, useRef } from 'react'

export default function HomePage() {
  const mountedRef = useRef(false)

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    initMingPan()
  }, [])

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <div className="bazi-flash" id="baziFlash">
        <div className="bazi-flash-ring">
          <span className="bazi-flash-char">命</span>
        </div>
      </div>
    </>
  )
}

/* ── 靜態 HTML 主體 ── */
const BODY_HTML = `<!-- ╔══════════════════════════════════════╗
     ║  USER BAR (LIFF Profile)            ║
     ╚══════════════════════════════════════╝ -->
<div class="user-bar" id="userBar">
  <img class="user-avatar" id="userAvatar" src="" alt="">
  <span id="userName"></span>
  <span style="color:var(--dim)">· 已連結 LINE</span>
</div>

<!-- ╔══════════════════════════════════════╗
     ║  HEADER + NAV TABS                  ║
     ╚══════════════════════════════════════╝ -->
<header class="app-header">
  <div class="header-inner">
    <div class="app-title" id="appTitle">命運星盤</div>
    <nav class="nav-tabs" role="tablist">
      <button class="nav-btn active" data-tab="bazi"   onclick="switchTab('bazi',this)"  role="tab">八字命盤</button>
      <button class="nav-btn"        data-tab="fortune" onclick="switchTab('fortune',this)" role="tab">直接抽籤</button>
    </nav>
  </div>
</header>

<!-- ╔══════════════════════════════════════╗
     ║  MAIN CONTENT                       ║
     ╚══════════════════════════════════════╝ -->
<main class="main">

  <!-- ══════ TAB 1 · 八字命盤 ══════ -->
  <section class="tab-panel active" id="tab-bazi">
    <div class="bazi-layout">

      <!-- LEFT: Input Form -->
      <div class="card">
        <div class="sec-label">輸入生辰資料</div>
        <div class="bazi-form">
          <div class="form-group">
            <label class="form-label">命主性別</label>
            <div class="gender-toggle">
              <button class="gender-btn active-male" id="gMale"   onclick="setGender('male')">
                <span class="gb-icon">♂</span>男命
              </button>
              <button class="gender-btn" id="gFemale" onclick="setGender('female')">
                <span class="gb-icon">♀</span>女命
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="iName">姓名</label>
            <input type="text" id="iName" class="form-input" placeholder="請輸入姓名（選填）">
          </div>
          <div class="form-group">
            <label class="form-label">出生日期</label>
            <!-- 隱藏的 date 值，供 calculateBaZi 讀取 -->
            <input type="hidden" id="iDate">
            <div class="date-selects">
              <select class="date-select" id="dYear"  onchange="syncDateInput()"></select>
              <select class="date-select" id="dMonth" onchange="syncDateInputMonth()">
                <option value="1">1月</option><option value="2">2月</option>
                <option value="3">3月</option><option value="4">4月</option>
                <option value="5">5月</option><option value="6">6月</option>
                <option value="7">7月</option><option value="8">8月</option>
                <option value="9">9月</option><option value="10">10月</option>
                <option value="11">11月</option><option value="12">12月</option>
              </select>
              <select class="date-select" id="dDay" onchange="syncDateInput()"></select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">出生時辰</label>
            <input type="hidden" id="iTime" value="11:00">
            <div class="shichen-wrap" id="shichenWrap">
              <div class="shichen-display" id="shichenDisplay" onclick="toggleShichen()">
                <span class="shichen-display-text" id="shichenText">午時　11:00–13:00</span>
                <span class="shichen-display-arrow">▼</span>
              </div>
              <div class="shichen-popup" id="shichenPopup"></div>
            </div>
          </div>
          <button class="btn-primary" onclick="calculateBaZi()">排 命 盤</button>
        </div>

        <!-- Timetable reference -->
        <div style="margin-top:16px;border-top:1px solid var(--border);padding-top:14px;">
          <div class="sec-label" style="margin-bottom:8px;">時辰對照</div>
          <div id="shiChen" style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;"></div>
        </div>
      </div>

      <!-- RIGHT: Results -->
      <div id="baziResult">
        <div class="ph-state" id="baziPH">
          <div class="ph-icon">☯</div>
          <p>請輸入姓名與生辰<br>點擊「排命盤」排出八字</p>
        </div>

        <div id="baziData" class="hidden">

          <!-- Pillars -->
          <div class="card" style="margin-bottom:16px;">
            <div id="nameDisp" style="font-size:0.88rem;color:var(--gold);letter-spacing:0.2em;margin-bottom:10px;"></div>
            <div class="sec-label">八字命盤 · 四柱</div>
            <div class="pillars-grid" id="pillarsGrid"></div>
          </div>

          <!-- Five Elements -->
          <div class="card" style="margin-bottom:16px;">
            <div class="sec-label">五行能量分析</div>
            <div class="el-grid" id="elGrid"></div>
            <div id="elComment" style="font-size:0.78rem;color:var(--muted);margin-top:12px;line-height:1.8;padding-top:10px;border-top:1px solid var(--border);"></div>
          </div>

          <!-- Day Master -->
          <div class="card" style="margin-bottom:16px;">
            <div class="sec-label">日主分析</div>
            <div id="dmBadge" class="dm-badge"></div>
            <div class="analysis-txt" id="dmDesc"></div>
            <div class="traits-row" id="dmTraits"></div>
            <div class="analysis-box" style="margin-top:14px;">
              <div class="analysis-ttl">格局簡析</div>
              <div class="analysis-txt" id="geJu"></div>
            </div>
          </div>

          <!-- ③.5 命格介紹 -->
          <div class="card" style="margin-bottom:16px;" id="cardMingGe">
            <div class="sec-label">命格 · 月支取格</div>
            <div class="gege-derive" id="gegeDeriveChain"></div>
            <div class="gege-banner" id="gegeBanner">
              <div class="gege-icon-wrap" id="gegeIcon"></div>
              <div class="gege-name-area">
                <div class="gege-name" id="gegeName"></div>
                <div class="gege-badges" id="gegeBadges"></div>
              </div>
            </div>
            <div class="analysis-txt" id="gegeSummary"></div>
            <div class="traits-row" id="gegeTraits"></div>
            <div class="gege-boxes" id="gegeBoxes"></div>
            <div class="gege-career" id="gegeCareer"></div>
            <div class="gege-advice" id="gegeAdvice"></div>
          </div>

          <!-- ④ 用神忌神 -->
          <div class="card" style="margin-bottom:16px;" id="cardYongShen">
            <div class="sec-label">用神 · 忌神 · 閒神</div>
            <div class="analysis-txt" id="yongDesc"></div>
            <div class="yong-row" id="yongRow"></div>
          </div>

          <!-- ⑤ 六親宮位 -->
          <div class="card" style="margin-bottom:16px;" id="cardPalace">
            <div class="sec-label">六親宮位解析</div>
            <table class="palace-table" id="palaceTable"></table>
          </div>

          <!-- ⑥ 人生各面向 -->
          <div class="card" style="margin-bottom:16px;" id="cardAspects">
            <div class="sec-label">人生各面向</div>
            <div class="reading-grid" id="aspectGrid"></div>
          </div>

          <!-- ⑦ 補運建議 -->
          <div class="card" id="cardSuggest">
            <div class="sec-label">補運建議</div>
            <div class="analysis-txt" id="suggestIntro"></div>
            <div class="suggest-grid" id="suggestGrid"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 1 外部連結 -->
    <div class="ext-link-wrap" id="extWrap0">
      <a class="ext-link-btn" id="extBtn0" href="#" target="_blank" rel="noopener">
        <span class="ext-link-icon">🎲</span>
        <span id="extText0">試試手氣</span>
      </a>
    </div>
  </section>

  <!-- ══════ TAB 2 · 直接抽籤 ══════ -->
  <section class="tab-panel" id="tab-fortune">
    <div class="fortune-layout">

      <!-- LEFT: Draw Panel -->
      <div class="card">
        <div class="draw-area">
          <div class="qian-wrap" id="qianWrap">
            <svg class="qian-svg" id="qianSvg" viewBox="0 0 100 195" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="qBodyG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#2a0606"/>
                  <stop offset="25%"  stop-color="#7a1212"/>
                  <stop offset="55%"  stop-color="#9b1a1a"/>
                  <stop offset="80%"  stop-color="#6a0e0e"/>
                  <stop offset="100%" stop-color="#220404"/>
                </linearGradient>
                <linearGradient id="qRimG" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stop-color="#f4dc90"/>
                  <stop offset="45%"  stop-color="#c9a84c"/>
                  <stop offset="100%" stop-color="#6a5018"/>
                </linearGradient>
                <linearGradient id="qStickG" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#5e4520"/>
                  <stop offset="45%"  stop-color="#d8b870"/>
                  <stop offset="100%" stop-color="#7a5c30"/>
                </linearGradient>
                <radialGradient id="qTopEG" cx="38%" cy="38%" r="65%">
                  <stop offset="0%"   stop-color="#d4a840"/>
                  <stop offset="100%" stop-color="#4a3008"/>
                </radialGradient>
                <filter id="qShadow" x="-20%" y="-10%" width="140%" height="130%">
                  <feDropShadow dx="2" dy="5" stdDeviation="5" flood-color="rgba(0,0,0,0.7)"/>
                </filter>
              </defs>

              <!-- ── Sticks (behind body) ── -->
              <g transform="translate(50,0)">
                <!-- outer sticks -->
                <rect x="-18" y="8"  width="4.5" height="56" rx="2" fill="url(#qStickG)" transform="rotate(-18,0,64)" opacity="0.65"/>
                <rect x="13"  y="8"  width="4.5" height="56" rx="2" fill="url(#qStickG)" transform="rotate(18,0,64)"  opacity="0.65"/>
                <!-- mid-outer -->
                <rect x="-11" y="3"  width="5"   height="60" rx="2" fill="url(#qStickG)" transform="rotate(-10,0,64)" opacity="0.85"/>
                <rect x="6"   y="3"  width="5"   height="60" rx="2" fill="url(#qStickG)" transform="rotate(10,0,64)"  opacity="0.85"/>
                <!-- center sticks -->
                <rect x="-5"  y="0"  width="5"   height="62" rx="2" fill="url(#qStickG)" transform="rotate(-4,0,64)"/>
                <rect x="0"   y="0"  width="5"   height="62" rx="2" fill="url(#qStickG)" transform="rotate(4,0,64)"/>
                <!-- tiny node marks -->
                <rect x="-5" y="40" width="5" height="1.5" rx="0.5" fill="rgba(0,0,0,0.35)" transform="rotate(-4,0,64)"/>
                <rect x="0"  y="40" width="5" height="1.5" rx="0.5" fill="rgba(0,0,0,0.35)" transform="rotate(4,0,64)"/>
              </g>

              <!-- ── Body shadow under base ── -->
              <ellipse cx="50" cy="186" rx="27" ry="5" fill="rgba(0,0,0,0.4)"/>

              <!-- ── Base bottom ── -->
              <ellipse cx="50" cy="176" rx="32" ry="7.5" fill="#150202"/>

              <!-- ── Main body rect ── -->
              <rect x="18" y="58" width="64" height="120" fill="url(#qBodyG)" filter="url(#qShadow)"/>

              <!-- ── Left sheen ── -->
              <rect x="18" y="58" width="12" height="120" fill="rgba(255,255,255,0.05)"/>
              <!-- ── Right shadow ── -->
              <rect x="70" y="58" width="12" height="120" fill="rgba(0,0,0,0.18)"/>

              <!-- ── Gold band top ── -->
              <rect x="18" y="58" width="64" height="10" fill="url(#qRimG)" opacity="0.7"/>

              <!-- ── Gold stripe mid-top ── -->
              <rect x="18" y="98" width="64" height="1.5" fill="rgba(201,168,76,0.45)"/>
              <!-- ── Decorative diamond row ── -->
              <text x="50" y="110" text-anchor="middle" font-size="6.5" fill="rgba(201,168,76,0.45)" letter-spacing="6" font-family="serif">◆◇◆◇◆</text>
              <!-- ── Gold stripe mid-bottom ── -->
              <rect x="18" y="115" width="64" height="1.5" fill="rgba(201,168,76,0.45)"/>

              <!-- ── Character label box ── -->
              <rect x="34" y="122" width="32" height="38" rx="3"
                fill="rgba(0,0,0,0.28)" stroke="rgba(201,168,76,0.4)" stroke-width="0.8"/>

              <!-- ── 籤 character ── -->
              <text x="50" y="149" text-anchor="middle"
                font-family="'Noto Serif TC',serif" font-size="26"
                fill="#c9a84c" font-weight="700" opacity="0.95">籤</text>

              <!-- ── Lower decorative row ── -->
              <rect x="18" y="166" width="64" height="1" fill="rgba(201,168,76,0.35)"/>
              <text x="50" y="162" text-anchor="middle" font-size="6" fill="rgba(201,168,76,0.3)" letter-spacing="7" font-family="serif">◇◆◇</text>

              <!-- ── Gold bottom rim band ── -->
              <rect x="18" y="168" width="64" height="9" fill="url(#qRimG)" opacity="0.82"/>
              <!-- ── Bottom ellipse gold ── -->
              <ellipse cx="50" cy="168" rx="32" ry="7.5" fill="url(#qRimG)" opacity="0.9"/>

              <!-- ── Top opening ellipse (gold rim) ── -->
              <ellipse cx="50" cy="58" rx="32" ry="7.5" fill="url(#qTopEG)"/>
              <!-- ── Inner dark hole ── -->
              <ellipse cx="50" cy="57" rx="25"  ry="5.5" fill="#0a0101" opacity="0.92"/>
              <!-- ── Inner rim highlight ── -->
              <ellipse cx="48" cy="55" rx="14"  ry="3"   fill="rgba(100,20,20,0.4)"/>

              <!-- ── Side handles ── -->
              <ellipse cx="13" cy="105" rx="5" ry="11" fill="#500808" stroke="url(#qRimG)" stroke-width="1.2"/>
              <ellipse cx="87" cy="105" rx="5" ry="11" fill="#500808" stroke="url(#qRimG)" stroke-width="1.2"/>
              <ellipse cx="13" cy="105" rx="2.5" ry="6" fill="rgba(201,168,76,0.2)"/>
              <ellipse cx="87" cy="105" rx="2.5" ry="6" fill="rgba(201,168,76,0.2)"/>
            </svg>
          </div>
          <div>
            <div style="font-size:0.7rem;color:var(--dim);text-align:center;margin-bottom:16px;letter-spacing:0.15em;">
              誠心叩請・求籤問事
            </div>
            <button class="btn-draw" id="drawBtn" onclick="drawFortune()">抽 籤</button>
          </div>
          <div class="draw-desc">
            靜心思念所求之事<br>
            點擊按鈕即可感應求籤
          </div>

          <!-- Draw count -->
          <div style="font-size:0.65rem;color:var(--dim);letter-spacing:0.1em;">
            本次已抽：<span id="drawCount">0</span> 籤
          </div>
        </div>
      </div>

      <!-- RIGHT: Result -->
      <div>
        <div class="ph-state" id="fortunePH">
          <div class="ph-icon">🎋</div>
          <p>尚未求籤<br>請點擊左方「抽籤」按鈕</p>
        </div>

        <div class="fortune-result" id="fortuneResult">
          <div class="card">
            <div class="f-header">
              <div>
                <div class="f-num" id="rNum"></div>
                <div class="f-cat" id="rCat"></div>
              </div>
              <div class="f-level" id="rLevel"></div>
            </div>

            <!-- Poem -->
            <div class="poem-box">
              <div class="poem-text" id="rPoem"></div>
              <div class="poem-meaning" id="rMeaning"></div>
            </div>

            <!-- Interpretation -->
            <div class="rs-title">整體解析</div>
            <div class="interp-text" id="rInterp"></div>

            <!-- Advice -->
            <div class="rs-title">各方面建議</div>
            <div class="advice-grid" id="rAdvice"></div>

            <!-- Redraw -->
            <div style="margin-top:16px;text-align:center;">
              <button class="btn-sm" onclick="drawFortune()" style="font-size:0.75rem;padding:8px 20px;">重新抽籤</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2 外部連結 -->
    <div class="ext-link-wrap" id="extWrap1">
      <a class="ext-link-btn" id="extBtn1" href="#" target="_blank" rel="noopener">
        <span class="ext-link-icon">🎲</span>
        <span id="extText1">試試手氣</span>
      </a>
    </div>
  </section>


</main>

<!-- 管理員齒輪按鈕 -->
<button class="admin-gear-btn" onclick="openAdmin()" title="管理員設定">
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.74-.07-1.08l2.32-1.8c.21-.17.27-.46.14-.69l-2.2-3.82c-.13-.23-.4-.31-.64-.23l-2.73 1.1c-.57-.44-1.18-.8-1.86-1.08l-.41-2.9A.527.527 0 0 0 14 2h-4c-.27 0-.5.19-.54.45l-.41 2.9c-.68.28-1.29.64-1.86 1.08L4.46 5.33c-.24-.08-.51 0-.64.23L1.62 9.38c-.13.23-.07.52.14.69l2.32 1.8C4.03 12.26 4 12.6 4 13s.03.74.07 1.08L1.75 15.88c-.21.17-.27.46-.14.69l2.2 3.82c.13.23.4.31.64.23l2.73-1.1c.57.44 1.18.8 1.86 1.08l.41 2.9c.04.26.27.45.54.45h4c.27 0 .5-.19.54-.45l.41-2.9c.68-.28 1.29-.64 1.86-1.08l2.73 1.1c.24.08.51 0 .64-.23l2.2-3.82c.13-.23.07-.52-.14-.69l-2.32-1.8z"/>
  </svg>
</button>

<!-- ╔══════════════════════════════════════╗
     ║  ADMIN MODAL                        ║
     ╚══════════════════════════════════════╝ -->
<div class="admin-bg" id="adminBg">
  <div class="admin-box">
    <button class="modal-close" onclick="closeAdmin()">✕</button>
    <div class="admin-title">
      ⚙ 後台管理
      <span class="admin-site-chip" id="adminSiteChip"></span>
    </div>

    <!-- 密碼登入 -->
    <div id="adminAuthArea">
      <div class="admin-section">
        <div class="admin-label">後台密碼</div>
        <input type="password" class="admin-input" id="loginPw" placeholder="••••••••"
               onkeydown="if(event.key==='Enter')doAdminLogin()" autofocus>
      </div>
      <button class="admin-btn save full" onclick="doAdminLogin()">登 入</button>
      <div class="admin-status err" id="adminAuthErr" style="margin-top:8px;text-align:left"></div>
    </div>

    <!-- 已登入主面板 -->
    <div id="adminMainPanel" style="display:none">
      <div class="admin-user-bar">
        <div class="admin-user-left">
          <span class="admin-user-avatar">⚙️</span>
          <div>
            <div class="admin-user-name">後台管理</div>
          </div>
        </div>
        <button class="admin-logout-btn" onclick="doAdminLogout()">登出</button>
      </div>

      <div class="admin-panel-tabs">
        <button class="admin-panel-tab active" id="ptSettings" onclick="switchPanelTab('settings')">按鈕設定</button>
        <button class="admin-panel-tab" id="ptPassword" onclick="switchPanelTab('password')">修改密碼</button>
      </div>

      <!-- 設定 Tab -->
      <div id="panelSettings">
        <div class="admin-section">
          <div class="admin-label">按鈕文字</div>
          <input type="text" class="admin-input" id="adminBtnText" placeholder="試試手氣" maxlength="20">
        </div>
        <div class="admin-section">
          <div class="admin-label">連結網址</div>
          <input type="url" class="admin-input" id="adminBtnUrl" placeholder="https://">
        </div>
        <div class="admin-section">
          <div class="admin-label">顯示按鈕</div>
          <div class="admin-toggle-row">
            <div class="admin-toggle on" id="adminToggle" onclick="toggleAdminBtn()"></div>
            <span class="admin-toggle-label" id="adminToggleLabel">顯示</span>
          </div>
        </div>
        <div class="admin-row">
          <button class="admin-btn cancel" onclick="closeAdmin()">取消</button>
          <button class="admin-btn save" onclick="saveAdminSettings()">儲存同步</button>
        </div>
        <div class="admin-status" id="adminSaveStatus"></div>
      </div>



      <!-- 修改密碼 Tab（本地模式專用）-->
      <div id="panelPassword" style="display:none">
        <div class="admin-section">
          <div class="admin-label">目前密碼</div>
          <input type="password" class="admin-input" id="pwCurrent" placeholder="輸入目前密碼">
        </div>
        <div class="admin-section">
          <div class="admin-label">新密碼（至少 4 個字元）</div>
          <input type="password" class="admin-input" id="pwNew" placeholder="輸入新密碼">
        </div>
        <div class="admin-section">
          <div class="admin-label">確認新密碼</div>
          <input type="password" class="admin-input" id="pwConfirm" placeholder="再次輸入新密碼">
        </div>
        <div class="admin-row">
          <button class="admin-btn cancel" onclick="switchPanelTab('settings')">取消</button>
          <button class="admin-btn save" onclick="changeLocalPassword()">確認修改</button>
        </div>
        <div class="admin-status" id="pwChangeStatus"></div>
      </div>

    </div>
  </div>
</div>

<!-- ╔══════════════════════════════════════╗
     ║  DETAIL MODAL                       ║
     ╚══════════════════════════════════════╝ -->
<div class="modal-bg" id="modalBg" onclick="bgClose(event)">
  <div class="modal-box" id="modalBox">
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div id="modalContent"></div>
  </div>
</div>



<!-- 排命盤閃光 overlay -->
<div class="bazi-flash" id="baziFlash">
  <div class="bazi-flash-ring">
    <span class="bazi-flash-char">命</span>
  </div>
</div>`

/* ── 客製化初始化 ── */
function initMingPan() {
  // Brand apply
  (function applyBrand(){
    var r = document.documentElement.style;
    if(BRAND.colorGold)    r.setProperty('--gold',      BRAND.colorGold);
    if(BRAND.colorGoldLt)  r.setProperty('--gold-lt',   BRAND.colorGoldLt);
    if(BRAND.colorGoldDim) r.setProperty('--gold-dim',  BRAND.colorGoldDim);
    if(BRAND.colorBg)      r.setProperty('--bg',        BRAND.colorBg);
    if(BRAND.colorS1)      r.setProperty('--s1',        BRAND.colorS1);
    if(BRAND.colorS2)      r.setProperty('--s2',        BRAND.colorS2);
    if(BRAND.colorText)    r.setProperty('--text',      BRAND.colorText);
    if(BRAND.colorMuted)   r.setProperty('--muted',     BRAND.colorMuted);
    if(BRAND.colorWood)    r.setProperty('--wood',      BRAND.colorWood);
    if(BRAND.colorFire)    r.setProperty('--fire',      BRAND.colorFire);
    if(BRAND.colorEarth)   r.setProperty('--earth',     BRAND.colorEarth);
    if(BRAND.colorMetal)   r.setProperty('--metal',     BRAND.colorMetal);
    if(BRAND.colorWater)   r.setProperty('--water',     BRAND.colorWater);

    // 標題
    if(BRAND.siteTitle)   document.title = BRAND.siteTitle;
    if(BRAND.headerTitle){
      var el = document.getElementById('appTitle');
      if(el) el.textContent = BRAND.headerTitle;
    }

    // 按鈕文字
    if(BRAND.extBtnText) DEFAULT_BTN_TEXT = BRAND.extBtnText;

    // 頁尾文字
    if(BRAND.footerText){
      var footer = document.createElement('div');
      footer.style.cssText = 'text-align:center;font-size:0.62rem;color:var(--dim);padding:14px 0 8px;letter-spacing:0.1em;';
      footer.textContent = BRAND.footerText;
      document.querySelector('main.main').appendChild(footer);
    }
  })();

  // Date selects
  buildDateSelects()
  window.syncDateInput      = syncDateInput
  window.syncDateInputMonth = syncDateInputMonth

  // Shichen popup
  buildShichenPopup()
  window.toggleShichen = toggleShichen
  window.selectShichen = selectShichen

  // Tab switch
  window.switchTab = switchTab

  // Bazi
  window.setGender     = setGender
  window.calculateBaZi = calculateBaZi

  // Fortune draw
  window.drawFortune          = drawFortune
  window.renderFortuneResult  = renderFortuneResult

  // Admin
  initAdmin()

  // Load settings from API
  loadSettingsFromAPI()

  // LIFF
  // LIFF ID 從環境變數讀取，不寫死在程式碼裡
  const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? ''
  if (typeof window !== 'undefined' && (window as any).liff) {
    ;(window as any).liff.init({ liffId: LIFF_ID })
      .then(() => {
        if ((window as any).liff.isLoggedIn()) {
          ;(window as any).liff.getProfile().then((p: any) => {
            const bar    = document.getElementById('userBar')
            const avatar = document.getElementById('userAvatar') as HTMLImageElement | null
            const name   = document.getElementById('userName')
            if (bar)    bar.style.display = 'flex'
            if (avatar) avatar.src = p.pictureUrl || ''
            if (name)   name.textContent = p.displayName || ''
          })
        }
      }).catch((e: Error) => console.log('LIFF:', e))
  }
}

/* ── Shichen popup (從 init() 提取) ── */
const SHI_CHEN_DATA = [
  {name:'子時',range:'23:00–01:00',branch:0},{name:'丑時',range:'01:00–03:00',branch:1},
  {name:'寅時',range:'03:00–05:00',branch:2},{name:'卯時',range:'05:00–07:00',branch:3},
  {name:'辰時',range:'07:00–09:00',branch:4},{name:'巳時',range:'09:00–11:00',branch:5},
  {name:'午時',range:'11:00–13:00',branch:6},{name:'未時',range:'13:00–15:00',branch:7},
  {name:'申時',range:'15:00–17:00',branch:8},{name:'酉時',range:'17:00–19:00',branch:9},
  {name:'戌時',range:'19:00–21:00',branch:10},{name:'亥時',range:'21:00–23:00',branch:11},
]
const SHICHEN_TIMES = ['23:00','01:00','03:00','05:00','07:00','09:00','11:00','13:00','15:00','17:00','19:00','21:00']
let shichenActive = 6

function buildShichenPopup() {
  const pop = document.getElementById('shichenPopup')
  if (!pop) return
  let html = ''
  for (let i = 0; i < SHI_CHEN_DATA.length; i++) {
    const s = SHI_CHEN_DATA[i]
    html += `<div class="shichen-opt${i === shichenActive ? ' active' : ''}" data-idx="${i}" onclick="selectShichen(${i})"><div class="shichen-opt-name">${s.name}</div><div class="shichen-opt-range">${s.range}</div></div>`
  }
  pop.innerHTML = html
}

function selectShichen(idx: number) {
  shichenActive = idx
  const s = SHI_CHEN_DATA[idx]
  const iTime = document.getElementById('iTime') as HTMLInputElement | null
  const text  = document.getElementById('shichenText')
  if (iTime) iTime.value = SHICHEN_TIMES[idx]
  if (text)  text.textContent = s.name + '\u3000' + s.range
  buildShichenPopup()
  closeShichen()
}

function toggleShichen() {
  const pop  = document.getElementById('shichenPopup')
  const disp = document.getElementById('shichenDisplay')
  if (!pop) return
  const isOpen = pop.classList.contains('open')
  if (isOpen) { closeShichen() } else {
    pop.classList.add('open')
    if (disp) disp.classList.add('open')
    buildShichenPopup()
  }
}

function closeShichen() {
  document.getElementById('shichenPopup')?.classList.remove('open')
  document.getElementById('shichenDisplay')?.classList.remove('open')
}

document.addEventListener('click', (e) => {
  const wrap = document.getElementById('shichenWrap')
  if (wrap && !wrap.contains(e.target as Node)) closeShichen()
})

/* ── Date selects ── */
function buildDateSelects() {
  const yearSel  = document.getElementById('dYear')  as HTMLSelectElement | null
  const daySel   = document.getElementById('dDay')   as HTMLSelectElement | null
  const monthSel = document.getElementById('dMonth') as HTMLSelectElement | null
  if (!yearSel || !daySel || !monthSel) return
  const today   = new Date()
  const curYear = today.getFullYear()
  for (let y = curYear; y >= 1930; y--) {
    const opt = document.createElement('option')
    opt.value = String(y); opt.textContent = y + '年'
    yearSel.appendChild(opt)
  }
  yearSel.value  = String(curYear)
  monthSel.value = String(today.getMonth() + 1)
  buildDayOptions()
  daySel.value   = String(today.getDate())
  syncDateInput()
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function buildDayOptions() {
  const daySel   = document.getElementById('dDay')   as HTMLSelectElement | null
  const yearSel  = document.getElementById('dYear')  as HTMLSelectElement | null
  const monthSel = document.getElementById('dMonth') as HTMLSelectElement | null
  if (!daySel || !yearSel || !monthSel) return
  const year   = parseInt(yearSel.value)
  const month  = parseInt(monthSel.value)
  const curDay = parseInt(daySel.value) || 1
  const maxDay = getDaysInMonth(year, month)
  daySel.innerHTML = ''
  for (let d = 1; d <= maxDay; d++) {
    const opt = document.createElement('option')
    opt.value = String(d); opt.textContent = d + '日'
    daySel.appendChild(opt)
  }
  daySel.value = String(Math.min(curDay, maxDay))
}

function syncDateInputMonth() { buildDayOptions(); syncDateInput() }

function syncDateInput() {
  const y = (document.getElementById('dYear')  as HTMLSelectElement | null)?.value || ''
  const m = String((document.getElementById('dMonth') as HTMLSelectElement | null)?.value || '').padStart(2, '0')
  const d = String((document.getElementById('dDay')   as HTMLSelectElement | null)?.value || '').padStart(2, '0')
  const hidden = document.getElementById('iDate') as HTMLInputElement | null
  if (hidden) hidden.value = `${y}-${m}-${d}`
}

/* ── switchTab ── */

function switchTab(id, btn){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
  const tabNavBtn=document.querySelector('[data-tab="'+id+'"]');
  if(tabNavBtn) tabNavBtn.classList.add('active');

  if(id==='query') renderAllFortunes();
}

/* ── setGender + calculateBaZi ── */

let currentGender='male'; // 'male' | 'female'

function setGender(g){
  currentGender=g;
  document.getElementById('gMale').className  ='gender-btn'+(g==='male'  ?' active-male':'');
  document.getElementById('gFemale').className='gender-btn'+(g==='female'?' active-female':'');
}

function calculateBaZi(){
  const name=document.getElementById('iName').value.trim()||'命主';
  const dateVal=document.getElementById('iDate').value;
  const timeVal=document.getElementById('iTime').value||'11:00';

  if(!dateVal){alert('請選擇出生日期');return;}

  const [y,m,d]=dateVal.split('-').map(Number);
  const [H,Min]=timeVal.split(':').map(Number);

  const bz=calcBaZi(y,m,d,H);
  const el=calcElements(bz);

  /* 閃光動畫，結束後顯示命盤 */
  var flash=document.getElementById('baziFlash');
  flash.classList.remove('firing');
  void flash.offsetWidth; // reflow
  flash.classList.add('firing');

  setTimeout(function(){
    /* Show result container */
    document.getElementById('baziPH').classList.add('hidden');
    var baziDataEl=document.getElementById('baziData');
    baziDataEl.classList.remove('hidden');
    baziDataEl.classList.remove('revealed');
    void baziDataEl.offsetWidth;
    baziDataEl.classList.add('revealed');

  /* Name display */
  document.getElementById('nameDisp').innerHTML=
    `${name} · ${y}年${m}月${d}日 ${timeVal}
     <span style="margin-left:8px;font-size:0.72rem;padding:2px 9px;border-radius:12px;letter-spacing:0.1em;
       ${currentGender==='male'
         ? 'background:rgba(58,128,204,0.15);border:1px solid rgba(58,128,204,0.4);color:#6ab0e8'
         : 'background:rgba(212,64,120,0.13);border:1px solid rgba(212,64,120,0.4);color:#e87aaa'}">
       ${currentGender==='male'?'♂ 男命':'♀ 女命'}
     </span>`;

  /* Render pillars */
  const labels=['年柱','月柱','日柱','時柱'];
  const keys=['year','month','day','hour'];
  let pg='';
  keys.forEach((k,i)=>{
    const p=bz[k];
    const sEl=S_EL[p.si], bEl=B_EL[p.bi];
    pg+=`
    <div class="pillar-card ${i===2?'style="border-color:var(--gold-dim)"':''}">
      <div class="pillar-label">${labels[i]}</div>
      <div class="pillar-stem" style="${i===2?'color:var(--gold-lt)':''}">${p.s}</div>
      <div class="pillar-branch">${p.b}</div>
      <span class="pillar-tag tag-${sEl}">${sEl}</span>
      <br><span class="pillar-tag tag-${bEl}" style="margin-top:3px">${bEl}</span>
      <div class="pillar-animal">${ANIMALS[p.bi]}</div>
    </div>`;
  });
  document.getElementById('pillarsGrid').innerHTML=pg;

  /* Render five elements */
  const els=['木','火','土','金','水'];
  const total=Object.values(el).reduce((a,b)=>a+b,0);
  let eg='';
  els.forEach(e=>{
    const pct=Math.round(el[e]/total*100);
    eg+=`
    <div class="el-row">
      <div class="el-name el-${e}">${e}</div>
      <div class="el-track">
        <div class="el-fill fill-${e}" data-pct="${pct}"></div>
      </div>
      <div class="el-cnt">${el[e]} (${pct}%)</div>
    </div>`;
  });
  document.getElementById('elGrid').innerHTML=eg;

  /* Animate bars */
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      document.querySelectorAll('.el-fill').forEach(b=>{
        b.style.width=b.dataset.pct+'%';
      });
    });
  });

  /* Five elements comment */
  const dominant=Object.entries(el).sort((a,b)=>b[1]-a[1])[0][0];
  const weak=Object.entries(el).sort((a,b)=>a[1]-b[1])[0][0];
  document.getElementById('elComment').textContent=
    `五行中「${dominant}」最旺盛，「${weak}」最薄弱。宜注意補強弱項，保持五行能量均衡。`;

  /* Day master */
  const dm=DM_DATA[bz.day.si];
  document.getElementById('dmBadge').innerHTML=`<span>日主</span><strong style="font-size:1rem">${bz.day.s}</strong><span>（${S_EL[bz.day.si]}）</span>`;
  document.getElementById('dmDesc').textContent=dm.d;
  document.getElementById('dmTraits').innerHTML=dm.t.map(t=>`<span class="trait-tag">${t}</span>`).join('');
  document.getElementById('geJu').textContent=getGejuAnalysis(bz,el);

  /* 命格 */
  renderMingGe(bz);

  /* Extended reading */
  renderExtendedAnalysis(bz,el,currentGender);

  }, 280); // setTimeout 結束 — 閃光後顯示
}


/* ══════════════════════════════════════════════════
   抽籤功能 FORTUNE DRAW
══════════════════════════════════════════════════ */
/* ── Fortune draw ── */
let drawCount=0;

function spawnFlyingSticks(){
  const wrap=document.getElementById('qianWrap');
  const count=3+Math.floor(Math.random()*3); // 3-5 sticks
  for(let i=0;i<count;i++){
    (function(idx){
      setTimeout(()=>{
        const s=document.createElement('div');
        s.className='fly-stick';
        // Random trajectory — mostly upward, spread sideways
        const ang=(Math.random()*130-65)*Math.PI/180; // -65° to +65° from vertical
        const force=55+Math.random()*70;
        const dx=Math.sin(ang)*force;
        const dy=-Math.cos(ang)*force*0.7;       // upward
        const dyFall=dy+80+Math.random()*60;     // + gravity fall
        const dxDrift=dx*(1+Math.random()*0.4);
        const dr=Math.random()*480-240;
        const r0=Math.random()*30-15;
        const len=32+Math.random()*16;
        const dur=520+Math.random()*280;
        const startX=32+Math.random()*36; // % across wrap
        s.style.cssText=`
          left:${startX}%;top:26%;height:${len}px;
          --dx:${dxDrift}px;--dy:${dyFall}px;--dr:${dr}deg;--r0:${r0}deg;
          animation-duration:${dur}ms;`;
        wrap.appendChild(s);
        setTimeout(()=>s.remove(),dur+120);
      },idx*90);
    })(i);
  }
}

function drawFortune(){
  const btn=document.getElementById('drawBtn');
  const wrap=document.getElementById('qianWrap');
  btn.classList.add('drawing');
  btn.disabled=true;
  wrap.classList.add('shaking');
  spawnFlyingSticks();

  setTimeout(()=>{
    wrap.classList.remove('shaking');
    const f=FORTUNES[Math.floor(Math.random()*FORTUNES.length)];
    renderFortuneResult(f);
    drawCount++;
    document.getElementById('drawCount').textContent=drawCount;
    btn.classList.remove('drawing');
    btn.disabled=false;
  },680);
}

function renderFortuneResult(f){
  document.getElementById('fortunePH').classList.add('hidden');

  const fr=document.getElementById('fortuneResult');
  fr.classList.remove('visible');
  void fr.offsetWidth; // reflow
  fr.classList.add('visible');

  document.getElementById('rNum').textContent=f.title;
  document.getElementById('rCat').textContent=f.category;
  document.getElementById('rLevel').className='f-level lv-'+f.level;
  document.getElementById('rLevel').textContent=f.level;
  document.getElementById('rPoem').textContent=f.poem;
  document.getElementById('rMeaning').textContent=f.poem_meaning;
  document.getElementById('rInterp').textContent=f.interpretation;

  const advIcons={general:'🌟',career:'💼',love:'❤️',health:'🌿',wealth:'💰'};
  const advLabels={general:'整體運勢',career:'事業職涯',love:'感情緣份',health:'身體健康',wealth:'財運錢財'};
  let adv='';
  Object.keys(advIcons).forEach(k=>{
    adv+=`<div class="advice-card">
      <div class="adv-icon">${advIcons[k]}</div>
      <div class="adv-cat">${advLabels[k]}</div>
      <div class="adv-text">${f.advice[k]}</div>
    </div>`;
  });
  document.getElementById('rAdvice').innerHTML=adv;
}

/* ── Settings API ── */
async function loadSettingsFromAPI() {
  try {
    const res  = await fetch('/api/settings')
    const data = await res.json() as { btnText: string; btnUrl: string; btnShow: boolean }
    applyExtSettings(data.btnText, data.btnUrl, data.btnShow)
  } catch { /* silent */ }
}

function applyExtSettings(text: string, url: string, show: boolean) {
  text = text || '開始轉運'
  for (let i = 0; i < 3; i++) {
    const btn  = document.getElementById('extBtn'  + i) as HTMLAnchorElement | null
    const txt  = document.getElementById('extText' + i)
    const wrap = document.getElementById('extWrap' + i) as HTMLElement | null
    if (!btn || !txt || !wrap) continue
    txt.textContent = text
    btn.href = url || '#'
    if (show) { btn.classList.remove('hidden-btn'); wrap.style.display = '' }
    else       { btn.classList.add('hidden-btn');    wrap.style.display = 'none' }
  }
}

/* ── Admin (API-backed) ── */
function initAdmin() {
  function openAdmin() {
    document.getElementById('adminBg')?.classList.add('open')
    checkAuthStatus()
  }
  function closeAdmin() {
    document.getElementById('adminBg')?.classList.remove('open')
  }
  document.getElementById('adminBg')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('adminBg')) closeAdmin()
  })

  async function checkAuthStatus() {
    const res  = await fetch('/api/auth')
    const data = await res.json() as { isAdmin: boolean }
    data.isAdmin ? showMainPanel() : showAuthArea()
  }

  function showAuthArea() {
    const auth = document.getElementById('adminAuthArea')
    const main = document.getElementById('adminMainPanel')
    if (auth) auth.style.display = ''
    if (main) main.style.display = 'none'
    const err = document.getElementById('adminAuthErr')
    if (err) err.textContent = ''
    setTimeout(() => (document.getElementById('loginPw') as HTMLInputElement | null)?.focus(), 100)
  }

  async function showMainPanel() {
    const auth = document.getElementById('adminAuthArea')
    const main = document.getElementById('adminMainPanel')
    if (auth) auth.style.display = 'none'
    if (main) main.style.display = ''
    switchPanelTab('settings')
    const res = await fetch('/api/settings')
    const cfg = await res.json() as { btnText: string; btnUrl: string; btnShow: boolean }
    ;(document.getElementById('adminBtnText') as HTMLInputElement | null) && ((document.getElementById('adminBtnText') as HTMLInputElement).value = cfg.btnText || '')
    ;(document.getElementById('adminBtnUrl')  as HTMLInputElement | null) && ((document.getElementById('adminBtnUrl')  as HTMLInputElement).value = cfg.btnUrl  || '')
    const tog = document.getElementById('adminToggle')
    const lbl = document.getElementById('adminToggleLabel')
    if (tog) tog.className = 'admin-toggle' + (cfg.btnShow ? ' on' : '')
    if (lbl) lbl.textContent = cfg.btnShow ? '顯示' : '隱藏'
  }

  async function doAdminLogin() {
    const pw  = (document.getElementById('loginPw') as HTMLInputElement | null)?.value || ''
    const err = document.getElementById('adminAuthErr')
    if (!pw) { if (err) err.textContent = '請輸入密碼'; return }
    if (err) err.textContent = '驗證中…'
    const res  = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    if (!res.ok) {
      if (err) { err.textContent = data.error || '密碼錯誤'; err.className = 'admin-status err' }
      ;(document.getElementById('loginPw') as HTMLInputElement | null)?.select()
      return
    }
    if (err) err.textContent = ''
    showMainPanel()
  }

  async function doAdminLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    showAuthArea()
  }

  async function saveAdminSettings() {
    const text = (document.getElementById('adminBtnText') as HTMLInputElement | null)?.value?.trim() || '開始轉運'
    const url  = (document.getElementById('adminBtnUrl')  as HTMLInputElement | null)?.value?.trim() || ''
    const show = document.getElementById('adminToggle')?.classList.contains('on') ?? true
    const st   = document.getElementById('adminSaveStatus')
    if (st) { st.textContent = '儲存中…'; st.className = 'admin-status' }
    const res  = await fetch('/api/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ btnText: text, btnUrl: url, btnShow: show }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    if (!res.ok) {
      if (st) { st.textContent = '儲存失敗：' + (data.error || ''); st.className = 'admin-status err' }
      return
    }
    applyExtSettings(text, url, show)
    if (st) st.textContent = '✓ 已儲存並同步至所有裝置'
    setTimeout(() => { if (st) st.textContent = ''; closeAdmin() }, 1400)
  }

  async function changeLocalPassword() {
    const cur     = (document.getElementById('pwCurrent')  as HTMLInputElement | null)?.value || ''
    const newPw   = (document.getElementById('pwNew')       as HTMLInputElement | null)?.value || ''
    const confirm = (document.getElementById('pwConfirm')   as HTMLInputElement | null)?.value || ''
    const st      = document.getElementById('pwChangeStatus')
    if (!cur || !newPw || !confirm) {
      if (st) { st.textContent = '請填寫所有欄位'; st.className = 'admin-status err' }; return
    }
    if (newPw.length < 6) {
      if (st) { st.textContent = '新密碼至少需要 6 個字元'; st.className = 'admin-status err' }; return
    }
    if (newPw !== confirm) {
      if (st) { st.textContent = '兩次密碼不一致'; st.className = 'admin-status err' }; return
    }
    if (st) st.textContent = '更新中…'
    const res  = await fetch('/api/auth', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: cur, newPassword: newPw, confirmPassword: confirm }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    if (!res.ok) {
      if (st) { st.textContent = data.error || '修改失敗'; st.className = 'admin-status err' }; return
    }
    if (st) { st.textContent = '✓ 密碼已修改！'; st.className = 'admin-status' }
    setTimeout(() => switchPanelTab('settings'), 1500)
  }

  function toggleAdminBtn() {
    const tog = document.getElementById('adminToggle')
    const lbl = document.getElementById('adminToggleLabel')
    if (!tog) return
    const on = tog.classList.contains('on')
    tog.className = 'admin-toggle' + (on ? '' : ' on')
    if (lbl) lbl.textContent = on ? '隱藏' : '顯示'
  }

  function switchPanelTab(tab: string) {
    const pSettings = document.getElementById('panelSettings')
    const pPassword = document.getElementById('panelPassword')
    if (pSettings) pSettings.style.display = tab === 'settings' ? '' : 'none'
    if (pPassword) pPassword.style.display = tab === 'password' ? '' : 'none'
    const ptSet = document.getElementById('ptSettings')
    const ptPw  = document.getElementById('ptPassword')
    if (ptSet) ptSet.className = 'admin-panel-tab' + (tab === 'settings' ? ' active' : '')
    if (ptPw)  ptPw.className  = 'admin-panel-tab' + (tab === 'password' ? ' active' : '')
    if (tab === 'password') {
      ;['pwCurrent','pwNew','pwConfirm'].forEach(id => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.value = ''
      })
      const st = document.getElementById('pwChangeStatus')
      if (st) st.textContent = ''
    }
  }

  Object.assign(window, {
    openAdmin, closeAdmin, doAdminLogin, doAdminLogout,
    saveAdminSettings, changeLocalPassword,
    toggleAdminBtn, switchPanelTab,
  })

  document.getElementById('loginPw')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') doAdminLogin()
  })

  try {
    if (new URLSearchParams(location.search).get('admin') !== null) openAdmin()
  } catch {}
}

/* ── 籤詩資料 ──*/
const FORTUNES = [

  /* ════ 第 01 籤 ════ */
  {
    id:1, title:"第一籤 · 乾坤泰運",
    poem:"乾坤開泰運亨通\n日月光輝照萬方\n四季平安無阻礙\n功名富貴自昌隆",
    level:"大吉", category:"上上籤",
    poem_meaning:"天地間運勢大開，日月光芒普照，四季安泰，功名富貴自然興隆。",
    interpretation:"此籤為上上大吉之兆，象徵天時地利人和，三才皆備。萬事如意，諸事順遂，凡有所求必得所願。宜積極進取，勿猶豫不決，把握此天賜良機。",
    advice:{general:"時機已至，宜大膽行動，把握當前良機，勿優柔寡斷。",career:"事業鴻圖大展，晉升有望，可積極推展新計畫。",love:"感情甜蜜順遂，有情人終成眷屬，宜表達心意。",health:"身體強健，精力充沛，保持良好作息即可。",wealth:"財源廣進，正財偏財皆有，投資獲利豐厚。"}
  },

  /* ════ 第 02 籤 ════ */
  {
    id:2, title:"第二籤 · 春花盛開",
    poem:"春風送暖百花開\n枝頭鳥語報佳來\n前程似錦人人羨\n好景常在不須猜",
    level:"大吉", category:"上上籤",
    poem_meaning:"春風送暖，百花盛開，枝頭鳥鳴報喜，前途光明令人羨慕，美好時光長久不變。",
    interpretation:"此籤如春花盛開，生機蓬勃，諸事皆宜。時運正旺，若有所求，宜趁此時節積極行動，必能水到渠成，心想事成。",
    advice:{general:"把握春天般的好時機，積極行動，一切如意。",career:"適合開展新事業或晉升計畫，貴人助力強。",love:"感情發展順利，婚事可成，單身者可望遇良緣。",health:"氣色極佳，精神飽滿，注意適度休息。",wealth:"進財順利，可考慮穩健型投資。"}
  },

  /* ════ 第 03 籤 ════ */
  {
    id:3, title:"第三籤 · 金榜題名",
    poem:"文昌星照功名顯\n金榜題名天下知\n鳳凰展翅衝霄漢\n一舉成名四海馳",
    level:"大吉", category:"上上籤",
    poem_meaning:"文昌星照耀，功名顯赫，金榜掛名，鳳凰展翅高飛，一鳴驚人名揚天下。",
    interpretation:"此籤主考試、求學、升遷大吉。文昌護佑，才華得以發揮，宜把握機會展現能力，必能一鳴驚人，功成名就。",
    advice:{general:"積極展現才能，機會來臨務必把握，不可退縮。",career:"適合競爭升遷、展開新職涯，考試必過。",love:"因緣際會，容易在職場或求學中遇到心儀對象。",health:"身心狀態絕佳，可積極挑戰自我極限。",wealth:"因表現出色而獲得加薪或獎金，財運大吉。"}
  },

  /* ════ 第 04 籤 ════ */
  {
    id:4, title:"第四籤 · 龍鳳呈祥",
    poem:"龍飛鳳舞慶吉祥\n百年好合喜洋洋\n夫妻和諧家業旺\n子孫滿堂福壽長",
    level:"大吉", category:"上上籤",
    poem_meaning:"龍鳳飛舞呈祥瑞，百年好合喜氣洋洋，夫妻和睦家業興旺，子孫滿堂福壽綿延。",
    interpretation:"此籤主婚姻家庭吉祥，若問婚事必成，夫妻感情深厚，家庭和睦興旺。諸事有貴人相助，萬事順遂，福氣長流。",
    advice:{general:"家庭和睦是最大的財富，珍惜眼前人，福氣自來。",career:"家庭穩定帶來事業基礎，工作順利。",love:"婚姻吉祥，適合論及婚嫁，感情長久穩定。",health:"家庭溫暖帶來心理健康，身體自然安泰。",wealth:"家業興旺，財運穩定，宜守成不宜冒進。"}
  },

  /* ════ 第 05 籤 ════ */
  {
    id:5, title:"第五籤 · 紫氣東來",
    poem:"紫氣東來瑞氣生\n福星高照萬事成\n財源滾滾如泉湧\n貴人相助事事興",
    level:"大吉", category:"上上籤",
    poem_meaning:"紫氣從東方而來，瑞氣充盈，福星高照，財源如泉水般湧現，貴人從旁相助萬事興旺。",
    interpretation:"紫氣東來為最吉之象徵，此籤主財運亨通，貴人運極旺。凡謀事必成，求財必得，宜主動出擊，貴人自會相助，成事指日可待。",
    advice:{general:"主動尋求貴人協助，廣結善緣，機遇自然降臨。",career:"貴人助力強，適合開創新局，異動升遷皆宜。",love:"因緣際會遇良緣，貴人為媒，感情順利。",health:"運氣旺盛，身體自然調和，注意飲食均衡。",wealth:"財運大旺，投資理財均有收穫，偏財運佳。"}
  },

  /* ════ 第 06 籤 ════ */
  {
    id:6, title:"第六籤 · 水到渠成",
    poem:"涓涓細流匯大江\n水到自然渠道成\n凡事耐心莫躁進\n功到自然事業興",
    level:"吉", category:"上吉籤",
    poem_meaning:"細流匯成大江，水到之處自然渠成，凡事需耐心不急躁，功夫到位事業自然興旺。",
    interpretation:"此籤主順勢而為，耐心等待時機。事情正在朝好的方向發展，只需按部就班，持之以恆，終必水到渠成，圓滿達成目標。",
    advice:{general:"耐心等待，按部就班，勿急於求成，自然水到渠成。",career:"正在發展中的計畫繼續推進，不宜急躁冒進。",love:"感情需要時間醞釀，耐心經營，緣分自然成熟。",health:"身體狀況逐步改善，保持規律生活習慣。",wealth:"財運穩步上升，穩健投資為宜，避免投機。"}
  },

  /* ════ 第 07 籤 ════ */
  {
    id:7, title:"第七籤 · 月圓人圓",
    poem:"皓月高懸照四方\n家人圓聚喜洋洋\n天倫之樂無窮盡\n平安健康是福祥",
    level:"吉", category:"上吉籤",
    poem_meaning:"明月高掛照四方，家人團聚喜氣洋洋，享受天倫之樂，平安健康是最大的福氣。",
    interpretation:"此籤主家庭圓滿，平安健康。提醒求籤者珍惜家人，把握與親人相處的時光，家和萬事興，幸福就在身邊。",
    advice:{general:"珍惜家人，多陪伴親人，家和才是真正的幸福。",career:"工作與家庭取得平衡，勿過度投入工作忽略家庭。",love:"感情穩定溫馨，適合增進彼此感情的旅行或活動。",health:"身心均衡，維持家庭和諧有助身心健康。",wealth:"財運平穩，量入為出，家庭財務規劃得宜。"}
  },

  /* ════ 第 08 籤 ════ */
  {
    id:8, title:"第八籤 · 竹報平安",
    poem:"翠竹搖風傳喜訊\n平安吉慶喜連連\n歲歲年年皆如意\n福如東海壽如山",
    level:"吉", category:"上吉籤",
    poem_meaning:"翠竹迎風傳送喜訊，平安吉慶連連，年年歲歲如意，福如東海壽如南山。",
    interpretation:"此籤主平安順遂，喜事連連。近期有好消息將至，宜保持樂觀開朗的心態，廣結善緣，福氣自然聚集。",
    advice:{general:"保持樂觀，廣結善緣，好消息即將到來。",career:"工作環境和諧，人際關係良好，順利推進。",love:"感情和諧，宜慶祝特殊紀念日增進感情。",health:"健康狀況良好，保持現有運動習慣。",wealth:"財運平順，可小額投資，穩健理財。"}
  },

  /* ════ 第 09 籤 ════ */
  {
    id:9, title:"第九籤 · 梅開五福",
    poem:"嚴冬過後梅花開\n傲雪凌霜展姿態\n苦盡甘來春日暖\n五福臨門喜自來",
    level:"吉", category:"上吉籤",
    poem_meaning:"嚴冬過後梅花盛開，傲雪凌霜展現風姿，苦盡甘來春暖花開，五福臨門喜氣自來。",
    interpretation:"此籤告示苦盡甘來，歷經磨難之後，好運即將降臨。目前雖有困難，但如梅花般堅持，必能迎來燦爛春天，五福降臨。",
    advice:{general:"堅持當前，苦盡甘來，好運就在前方，勿放棄。",career:"雖有挫折，持續努力必有出頭之日。",love:"感情雖有小波折，堅持下去終能甜蜜。",health:"身體正在恢復中，保持正面心態有助康復。",wealth:"財務雖有壓力，持續努力即可解困。"}
  },

  /* ════ 第 10 籤 ════ */
  {
    id:10, title:"第十籤 · 雲開見日",
    poem:"烏雲散盡日出來\n萬里無雲天開懷\n困難一過光明現\n前途似錦笑顏開",
    level:"吉", category:"上吉籤",
    poem_meaning:"烏雲散盡陽光普照，萬里晴空開朗明媚，困難一過光明即現，前途似錦笑顏開懷。",
    interpretation:"此籤主否極泰來，困境即將結束，光明前途在望。近期雖有壓力，但烏雲即將消散，好運必至，保持信心，積極面對。",
    advice:{general:"困難即將過去，保持信心，光明就在前方。",career:"工作上的阻礙即將解除，新機會即將出現。",love:"感情的誤會或困境即將化解，關係恢復和諧。",health:"疾病或不適即將好轉，繼續就醫或保健。",wealth:"財務困境即將解脫，資金有望回流。"}
  },

  /* ════ 第 11 籤 ════ */
  {
    id:11, title:"第十一籤 · 行舟順風",
    poem:"順風行舟一帆揚\n波平浪靜好時光\n把準方向莫回頭\n目的地上好風光",
    level:"中吉", category:"中吉籤",
    poem_meaning:"順風而行帆船高揚，波平浪靜好時光，掌準方向莫回頭，目的地有好風光等候。",
    interpretation:"此籤主方向正確，宜順勢而行。目前走的方向是對的，保持定力，不受外力干擾，堅定前行，目標必能達成。",
    advice:{general:"方向正確，堅定前行，不受干擾，目標自達。",career:"現在的工作方向正確，繼續努力即可。",love:"感情走向正軌，繼續維持現有的相處模式。",health:"健康管理方向正確，繼續保持。",wealth:"財務規劃正確，按計畫執行即可。"}
  },

  /* ════ 第 12 籤 ════ */
  {
    id:12, title:"第十二籤 · 耕耘收穫",
    poem:"辛勤耕耘汗水灑\n秋收時節稻花香\n一分耕耘一分收\n天道酬勤自有賞",
    level:"中吉", category:"中吉籤",
    poem_meaning:"辛勤耕耘灑下汗水，秋收時稻花飄香，一分耕耘一分收穫，天道酬勤必有獎賞。",
    interpretation:"此籤告示付出必有回報，天道酬勤。目前雖需努力，但辛苦不會白費，按時收穫必至。唯需踏實耕耘，切勿投機取巧。",
    advice:{general:"踏實努力，天道酬勤，付出必有豐收。",career:"認真工作必獲獎賞，避免走捷徑投機。",love:"用心經營感情，付出愛必有回報。",health:"規律運動飲食，健康自然改善。",wealth:"穩健理財，耕耘日久自有收穫。"}
  },

  /* ════ 第 13 籤 ════ */
  {
    id:13, title:"第十三籤 · 蓄勢待發",
    poem:"蛟龍潛淵蓄力量\n時機一到衝霄漢\n伏久必有飛天日\n靜待良機不急躁",
    level:"中吉", category:"中吉籤",
    poem_meaning:"蛟龍潛藏淵底蓄積力量，時機一到衝上雲霄，沉潛久了必有飛天之日，靜待良機切勿急躁。",
    interpretation:"此籤主蓄勢待發，時機未到宜靜候。如蛟龍潛淵，低調蓄積能量，等待最佳時機出擊，切勿急於求成，時到自然一飛衝天。",
    advice:{general:"靜心等待時機，勿急躁冒進，蓄勢待發。",career:"現在是累積實力的好時機，不宜急於跳槽或轉行。",love:"感情上稍安勿躁，時機成熟再表白。",health:"養精蓄銳，避免過度消耗體力。",wealth:"積累資本，等待投資時機，切勿冒進。"}
  },

  /* ════ 第 14 籤 ════ */
  {
    id:14, title:"第十四籤 · 謹慎前行",
    poem:"山路崎嶇步步難\n謹慎前行莫貪快\n穩住腳步看清路\n終能安抵目的地",
    level:"平", category:"中平籤",
    poem_meaning:"山路崎嶇步步艱難，謹慎前行切莫貪快，穩住腳步看清路況，終能安全抵達目的地。",
    interpretation:"此籤提醒謹慎行事，路途雖然不易，但謹慎小心，穩扎穩打，仍可達到目標。切勿貪快冒險，以穩健為上策。",
    advice:{general:"謹慎小心，穩扎穩打，切勿貪快冒進。",career:"工作上注意細節，謹慎行事，避免大意失誤。",love:"感情發展需循序漸進，勿操之過急。",health:"注意安全，謹防意外，定期健康檢查。",wealth:"財務需謹慎，避免高風險投資，以穩健為主。"}
  },

  /* ════ 第 15 籤 ════ */
  {
    id:15, title:"第十五籤 · 守正待時",
    poem:"守住本心莫動搖\n正道而行必有成\n邪風吹來不為動\n靜候佳音天自知",
    level:"平", category:"中平籤",
    poem_meaning:"守住本心不動搖，正道而行必有成就，邪風吹來不為所動，靜候佳音天道自知。",
    interpretation:"此籤提醒守正不阿，走正道必有好結果。面對誘惑或壓力，堅持正道不動搖，不走旁門左道，守正待時，終有好消息。",
    advice:{general:"堅守正道，不受誘惑，守正必有天助。",career:"工作上保持誠信，不走捷徑，正道必成。",love:"感情保持真誠，不要算計，真心換真情。",health:"保持規律健康的生活方式，不要輕信偏方。",wealth:"正當謀財，勿貪不義之財，穩健理財。"}
  },

  /* ════ 第 16 籤 ════ */
  {
    id:16, title:"第十六籤 · 雨後彩虹",
    poem:"驟雨初晴虹光現\n天光雲影共徘徊\n風雨過後自有晴\n好景就在眼前來",
    level:"平", category:"中平籤",
    poem_meaning:"驟雨初晴後彩虹出現，天光雲影相互映照，風雨過後自有晴天，美好景象就在眼前。",
    interpretation:"此籤告知風雨之後必有彩虹。目前所面臨的困難只是暫時的，熬過去就是雨後天晴，好景在望，保持耐心不放棄。",
    advice:{general:"風雨暫時，彩虹即來，保持耐心必見好景。",career:"工作上的困難是暫時的，熬過去前途光明。",love:"感情有些波折，熬過這段考驗後會更穩固。",health:"身體不適是暫時的，積極治療必能康復。",wealth:"財務困難是短暫的，撐過去好轉可期。"}
  },

  /* ════ 第 17 籤 ════ */
  {
    id:17, title:"第十七籤 · 靜觀其變",
    poem:"萬物靜觀皆自得\n四時佳興與人同\n暫且緩步觀天時\n時機到來再行動",
    level:"平", category:"中平籤",
    poem_meaning:"萬物靜靜觀察皆有所得，四季美好與眾人共賞，暫且緩步觀察天時，時機來到再行動。",
    interpretation:"此籤主靜觀其變，現在不是行動的最佳時機，宜收斂觀察，待時機成熟再出手。冷靜分析形勢，不宜輕舉妄動。",
    advice:{general:"靜觀時局，不輕易行動，觀察形勢待機而動。",career:"暫時不宜大動作，靜觀職場變化再作決定。",love:"感情上觀察對方心意，不要操之過急。",health:"定期觀察身體狀況，不適及早就醫，不拖延。",wealth:"觀察市場動態，不急於投資，等待時機。"}
  },

  /* ════ 第 18 籤 ════ */
  {
    id:18, title:"第十八籤 · 慎言慎行",
    poem:"禍從口出要謹慎\n言多必失人心散\n三思而後再行動\n慎始敬終無憾事",
    level:"平", category:"中平籤",
    poem_meaning:"禍從口出要謹慎，話多容易失誤，三思而後行動，從始到終謹慎才能無憾。",
    interpretation:"此籤提醒言行謹慎。近期容易因言語不慎引起紛爭，或因衝動行事造成後悔。三思而後行，謹言慎行，方能避免不必要的麻煩。",
    advice:{general:"三思而行，謹言慎行，避免衝動造成後悔。",career:"工作上注意言行，勿在背後議論他人。",love:"感情上謹慎表達，避免失言傷感情。",health:"謹慎對待身體警訊，不拖延就醫。",wealth:"財務決策謹慎，勿衝動投資後悔。"}
  },

  /* ════ 第 19 籤 ════ */
  {
    id:19, title:"第十九籤 · 逆流而上",
    poem:"逆水行舟不退縮\n艱難困苦磨心志\n回頭方知山已高\n堅持才是真英雄",
    level:"凶", category:"下籤",
    poem_meaning:"逆水行舟不退縮，艱難困苦磨練心志，回頭才知走了多高，堅持才是真英雄。",
    interpretation:"此籤主當前困難重重，如逆流而上，阻力甚大。雖然艱辛，但若能堅持不退，困難過後回首將發現成長甚多。切勿輕易放棄。",
    advice:{general:"困難時期堅持最重要，熬過去必有成長。",career:"工作遭遇逆境，保持鬥志，困境是磨練。",love:"感情面臨考驗，需要雙方共同努力克服。",health:"身體需積極治療，不可消極放棄。",wealth:"財務困難時期，積極開源節流，挺過難關。"}
  },

  /* ════ 第 20 籤 ════ */
  {
    id:20, title:"第二十籤 · 暗礁潛伏",
    poem:"平靜水面藏暗礁\n表象平和內有危\n小心駕駛看清楚\n繞過暗礁自然行",
    level:"凶", category:"下籤",
    poem_meaning:"平靜水面下藏著暗礁，表面平和內有危機，小心駕駛看清楚，繞過暗礁自然順行。",
    interpretation:"此籤提示警覺，表面平靜下隱藏危機。近期需格外謹慎，凡事不要只看表象，要深入了解情況，避開潛在的風險和陷阱。",
    advice:{general:"提高警覺，不要只看表面，謹防隱藏的危機。",career:"職場上有隱患，小心同事間的暗流，謹慎應對。",love:"感情中有隱憂，注意對方真實想法，誠心溝通。",health:"注意身體細節，定期健檢，預防潛在疾病。",wealth:"財務有隱患，仔細審查合約，謹防詐騙損失。"}
  },

  /* ════ 第 21 籤 ════ */
  {
    id:21, title:"第二十一籤 · 風雨同舟",
    poem:"狂風驟雨同舟行\n患難與共見真情\n危機過後情更濃\n攜手共渡萬事成",
    level:"吉", category:"上吉籤",
    poem_meaning:"狂風驟雨中同舟共濟，患難與共見識真情，危機過後感情更深，攜手共渡萬事皆成。",
    interpretation:"此籤主患難見真情，雖有考驗但有真誠夥伴相助。面臨困難時不要獨自承擔，與信任的人攜手共渡，危機之後感情更深厚。",
    advice:{general:"患難時刻更需信任夥伴，共同面對，攜手度難關。",career:"工作上的困難與同伴共同承擔，合作力量大。",love:"感情遭遇考驗，正是深化感情的好機會。",health:"身體不適時尋求家人支持，勿獨自承受。",wealth:"財務困難時與信任的人商量，合作解困。"}
  },

  /* ════ 第 22 籤 ════ */
  {
    id:22, title:"第二十二籤 · 積少成多",
    poem:"涓涓細流積大海\n粒粒稻米成穀倉\n積少成多莫輕視\n持之以恆自豐盛",
    level:"中吉", category:"中吉籤",
    poem_meaning:"涓涓細流積成大海，粒粒稻米積成穀倉，積少成多不要輕視，持之以恆自然豐盛。",
    interpretation:"此籤主積累的重要性，勿好高騖遠，從小處做起，持之以恆，量的積累必然帶來質的飛躍。踏實累積，終必豐收。",
    advice:{general:"從小事做起，積少成多，持之以恆自然豐盛。",career:"不求一步登天，穩紮穩打，累積實力。",love:"感情從小事中培養，日積月累，愛情深厚。",health:"健康管理從小習慣開始，持之以恆效果顯著。",wealth:"小額積累，複利增長，長期投資效果佳。"}
  },

  /* ════ 第 23 籤 ════ */
  {
    id:23, title:"第二十三籤 · 守株待兔",
    poem:"坐待時機空費時\n機遇不等懈怠人\n主動出擊把握機\n收穫必在勤奮人",
    level:"平", category:"中平籤",
    poem_meaning:"坐等時機只是空費時間，機遇不等待懈怠的人，主動出擊把握機會，收穫必屬於勤奮之人。",
    interpretation:"此籤警示不可消極等待。機遇不會自動降臨，需要主動創造和把握。如守株待兔，坐等機運，必然一無所獲，宜積極主動尋求機會。",
    advice:{general:"主動出擊，積極創造機會，勿消極坐等。",career:"主動爭取機會，積極表現，勿等待別人給機會。",love:"感情主動表達心意，等待只會錯失良機。",health:"主動健康管理，定期檢查，不要等出問題再治療。",wealth:"主動開源，積極尋找投資機會，勿消極守舊。"}
  },

  /* ════ 第 24 籤 ════ */
  {
    id:24, title:"第二十四籤 · 虎落平陽",
    poem:"虎落平陽被犬欺\n英雄落難暫收聲\n養精蓄銳待時機\n重振雄風有一日",
    level:"凶", category:"下籤",
    poem_meaning:"老虎落到平原被狗欺負，英雄落難暫時低調，養精蓄銳等待時機，終有一天重振雄風。",
    interpretation:"此籤主暫處逆境，需低調蓄力。目前環境不利，形勢對己不利，宜暫時退守，養精蓄銳，待機而動，切勿硬碰硬，時機到必可重振。",
    advice:{general:"暫時低調，養精蓄銳，待時機再展雄風。",career:"職場逆境暫時退守，蓄積實力，等待反擊。",love:"感情遭挫，暫時放下，給雙方空間，待機緣。",health:"身體需要休養，不可硬撐，積極療養。",wealth:"財務遭受打擊，保守守財，等待翻身。"}
  },

  /* ════ 第 25 籤 ════ */
  {
    id:25, title:"第二十五籤 · 貴人引路",
    poem:"迷途之時有人扶\n貴人引路走正途\n感恩回報莫忘懷\n善因善果自循環",
    level:"吉", category:"上吉籤",
    poem_meaning:"迷途時有人扶助，貴人引路走上正途，感恩回報不要忘懷，善因善果自然循環。",
    interpretation:"此籤主貴人相助，感恩知報。近期有貴人出現，助你指點迷津或引薦機會，要懂得感恩，廣結善緣，善因種善果，貴人運持續旺盛。",
    advice:{general:"感恩貴人幫助，廣結善緣，善因善果循環。",career:"有貴人引薦機會，把握並心存感激。",love:"有人為你牽線或給予感情建議，好好珍惜。",health:"醫生或健康顧問的建議很重要，認真聽取。",wealth:"有人給予財務建議，謹慎聽取，感恩回報。"}
  },

  /* ════ 第 26 籤 ════ */
  {
    id:26, title:"第二十六籤 · 明珠出水",
    poem:"久藏深海明珠出\n光芒四射耀人眼\n是金子總會發光\n才華必獲人賞識",
    level:"吉", category:"上吉籤",
    poem_meaning:"久藏深海的明珠浮出水面，光芒四射耀眼奪目，是金子終會發光，才華必定獲得賞識。",
    interpretation:"此籤主才華將被賞識，機遇降臨。長期努力積累的成果即將獲得認可，才能得以展現，宜主動展示實力，明珠不可永久藏匿。",
    advice:{general:"才華即將獲得賞識，主動展示實力，勿藏拙。",career:"工作上的能力將被看見，可主動爭取重要項目。",love:"展示真實的自己，才能遇到真正欣賞你的人。",health:"身體有潛力，積極運動保健，展現最佳狀態。",wealth:"理財才能將被認可，可尋求投資合作機會。"}
  },

  /* ════ 第 27 籤 ════ */
  {
    id:27, title:"第二十七籤 · 知足常樂",
    poem:"知足之人常快樂\n貪心不足蛇吞象\n人心知足天地寬\n適可而止自安然",
    level:"中吉", category:"中吉籤",
    poem_meaning:"知足的人常感快樂，貪心不足如蛇吞象，人心知足天地自寬，適可而止自然安然。",
    interpretation:"此籤提醒知足惜福。目前的狀況已是福氣，不可貪心不足，知足者常樂。對現有的一切心存感激，不過分追求，自然心安理得，幸福長久。",
    advice:{general:"知足惜福，不貪多，對現有的感恩珍惜。",career:"工作上適可而止，勿過度貪功，知足常樂。",love:"感情中知足感恩，不過分要求，珍惜現有。",health:"生活方式適可而止，不過勞過逸，均衡最佳。",wealth:"財富夠用即可，貪多反失，知足才是真富有。"}
  },

  /* ════ 第 28 籤 ════ */
  {
    id:28, title:"第二十八籤 · 孤軍奮戰",
    poem:"孤身奮戰路難行\n借助他人力量生\n眾志成城事可成\n孤掌難鳴莫強撐",
    level:"平", category:"中平籤",
    poem_meaning:"孤身奮戰道路艱難，借助他人力量才能前進，眾志成城才能成事，孤掌難鳴不要硬撐。",
    interpretation:"此籤提示善借外力，不可孤軍奮戰。目前形勢需要借助他人力量，不可凡事親力親為，善用資源，廣集眾力，合力才能成大事。",
    advice:{general:"學會借助外力，不孤軍奮戰，合作力量更大。",career:"工作上主動尋求協助，建立團隊合作關係。",love:"感情需要雙方共同努力，不可一個人撐著。",health:"身體有病尋求醫療協助，勿諱疾忌醫。",wealth:"財務困難尋求協助，合作投資風險分散。"}
  },

  /* ════ 第 29 籤 ════ */
  {
    id:29, title:"第二十九籤 · 塞翁失馬",
    poem:"塞翁失馬焉知非福\n禍福相依難預料\n眼前損失莫悲傷\n轉機就在失落中",
    level:"平", category:"中平籤",
    poem_meaning:"塞翁失馬怎知不是福，禍福相依難以預料，眼前損失不要悲傷，轉機就在失落當中。",
    interpretation:"此籤主塞翁失馬，禍福相倚。目前看似不順的事，其中可能藏有轉機，不可因一時失意而過度悲傷，換個角度看，或許是更好機會的開始。",
    advice:{general:"換個角度看失意，禍中有福，轉機在望。",career:"工作上的挫折可能是轉換跑道的契機，開放心態。",love:"感情上的失落可能讓你遇到更合適的人。",health:"身體某方面的問題讓你發現並解決更深的問題。",wealth:"財務損失中找出教訓，可以讓未來更謹慎。"}
  },

  /* ════ 第 30 籤 ════ */
  {
    id:30, title:"第三十籤 · 暗夜行路",
    poem:"黑夜漫長熬到天\n黎明前夕最黑暗\n堅持信念不放棄\n晨曦終將照大地",
    level:"凶", category:"下籤",
    poem_meaning:"黑夜漫長熬到天亮，黎明前夕最為黑暗，堅持信念不放棄，晨曦終將照耀大地。",
    interpretation:"此籤主正處最艱難時期，但黎明即將到來。目前是最困難的時刻，如黎明前的最黑暗，只要不放棄，天必明，堅持信念，光明就在不遠處。",
    advice:{general:"黎明前最黑暗，堅持信念，天亮在即。",career:"工作最艱難時期，再撐一下，轉機即現。",love:"感情最低潮，不要輕易放棄，天亮自有轉機。",health:"病情雖重，積極配合治療，康復在望。",wealth:"財務最困難，節衣縮食，度過難關即見曙光。"}
  },

  /* ════ 第 31 籤 ════ */
  {
    id:31, title:"第三十一籤 · 鷹擊長空",
    poem:"大鵬展翅沖九霄\n搏擊長空志氣高\n天高任鳥飛翔去\n英雄用武正當時",
    level:"大吉", category:"上上籤",
    poem_meaning:"大鵬展翅沖上九霄，搏擊長空志氣高昂，天高任鳥飛翔，英雄用武正當其時。",
    interpretation:"此籤主英雄用武之地，大展身手的時機到來。此乃大吉之兆，才能得以充分發揮，宜積極進取，放開手腳大展雄圖，必有所成。",
    advice:{general:"英雄用武時機已到，大展身手，積極進取。",career:"職場大好機會來臨，積極爭取，展現實力。",love:"主動追求心儀對象，大膽表白，成功可期。",health:"精力旺盛，適合挑戰體能，積極運動。",wealth:"投資創業好時機，積極進取，大有斬獲。"}
  },

  /* ════ 第 32 籤 ════ */
  {
    id:32, title:"第三十二籤 · 柳暗花明",
    poem:"山重水複疑無路\n柳暗花明又一村\n困境之中莫灰心\n轉角必有新天地",
    level:"吉", category:"上吉籤",
    poem_meaning:"山重水複似乎無路，轉角柳暗花明又一村，困境中不要灰心，轉角必有新天地。",
    interpretation:"此籤帶來希望，前方困境即將峰迴路轉，柳暗花明。目前雖有阻礙，但只要不放棄，前行必遇轉機，新局面即將展開，充滿希望。",
    advice:{general:"前方有轉機，不要放棄，峰迴路轉必有新局。",career:"工作困境即將化解，新機會在轉角等待。",love:"感情有轉機，再努力一下，新局面即將開展。",health:"治療有效果，繼續堅持，好轉就在前方。",wealth:"財務有轉機，繼續努力，困境即將解除。"}
  },

  /* ════ 第 33 籤 ════ */
  {
    id:33, title:"第三十三籤 · 厚積薄發",
    poem:"十年磨一劍鋒利\n積累功夫待發時\n深根固本強根基\n厚積薄發一鳴驚",
    level:"中吉", category:"中吉籤",
    poem_meaning:"十年磨劍終成鋒利，積累功夫等待發揮之時，深根固本強化基礎，厚積薄發一鳴驚人。",
    interpretation:"此籤主積累實力，待機而發。此刻是積累和準備的階段，不急於表現，深根固本，當厚積到一定程度，薄發時必然一鳴驚人，令人刮目相看。",
    advice:{general:"持續積累實力，深根固本，時機一到必然驚人。",career:"現在是學習積累期，打好基礎，未來必大放異彩。",love:"感情慢慢培養，積累感情，水到渠成。",health:"健康是長期積累，持之以恆的保健最有效。",wealth:"長期投資積累，複利效應，時間是最好的朋友。"}
  },

  /* ════ 第 34 籤 ════ */
  {
    id:34, title:"第三十四籤 · 廣結善緣",
    poem:"廣結善緣處處情\n好人好事自相逢\n善緣福緣連帶來\n行善積德福自生",
    level:"吉", category:"上吉籤",
    poem_meaning:"廣結善緣處處有情義，好人好事自然相逢，善緣帶來福緣，行善積德福氣自生。",
    interpretation:"此籤主廣結善緣，行善積德。近期人際關係旺盛，多行善事，廣結善緣，自然得到福報，貴人也會相助，諸事皆因善緣而順遂。",
    advice:{general:"廣結善緣，多行善事，福報自然隨之而來。",career:"職場多助人，建立良好人脈，貴人自然助你。",love:"真誠待人，廣結善緣，良緣自然到來。",health:"心態正面樂觀，行善助人，身心健康自然好。",wealth:"助人為善，財富自然循環，好人有好報。"}
  },

  /* ════ 第 35 籤 ════ */
  {
    id:35, title:"第三十五籤 · 心靜自然涼",
    poem:"心若止水風自停\n靜心處世萬事寧\n焦躁只會亂方寸\n平靜應對智慧生",
    level:"平", category:"中平籤",
    poem_meaning:"心如止水風自然停，靜心處世萬事安寧，焦躁只會亂了方寸，平靜應對自生智慧。",
    interpretation:"此籤提醒保持平靜心態。目前情況需要冷靜應對，焦躁急躁只會讓情況更糟，靜下心來，以冷靜清醒的頭腦分析形勢，智慧自然湧現。",
    advice:{general:"保持冷靜，靜心思考，焦躁時先深呼吸。",career:"工作壓力大時保持冷靜，不要情緒化決策。",love:"感情問題冷靜處理，不要在情緒激動時溝通。",health:"壓力是健康大敵，學習靜心減壓。",wealth:"財務決策需冷靜理性，不受情緒左右。"}
  },

  /* ════ 第 36 籤 ════ */
  {
    id:36, title:"第三十六籤 · 潮起潮落",
    poem:"潮水起落自有時\n人生高低是常態\n低潮時節蓄力量\n高潮到來盡展翅",
    level:"平", category:"中平籤",
    poem_meaning:"潮水漲落自有其時，人生高低是正常狀態，低潮時蓄積力量，高潮來臨時盡情展翅。",
    interpretation:"此籤示人生起伏乃常態。目前可能處於低潮期，但如同潮水，低潮之後必有高潮。低潮期好好蓄積能量，等待高潮時全力施展。",
    advice:{general:"接受人生起伏，低潮蓄力，高潮展翅，順應自然。",career:"職場低潮期沉潛學習，等待高峰期爆發。",love:"感情有起伏很正常，低潮期互相支持。",health:"身體狀況有起伏，低潮期好好休養。",wealth:"財運也有起伏，低潮期保守，高潮期積極。"}
  },

  /* ════ 第 37 籤 ════ */
  {
    id:37, title:"第三十七籤 · 慎防小人",
    poem:"小人當道暗傷人\n防人之心不可無\n謹言慎行少樹敵\n遠離是非保自身",
    level:"凶", category:"下籤",
    poem_meaning:"小人當道在暗中傷人，防人之心不可沒有，謹言慎行少結怨敵，遠離是非保護自身。",
    interpretation:"此籤提醒小心小人。近期周遭有人會在背後造謠或陷害，需提高警覺，謹言慎行，少說話少得罪人，遠離是非口舌，保護自身安全。",
    advice:{general:"提高警覺，防範小人，謹言慎行，遠離是非。",career:"職場有人暗中較勁，謹慎應對，不輕信他人。",love:"感情中謹防第三者或出於嫉妒的破壞者。",health:"情緒壓力大，謹防因小人困擾影響健康。",wealth:"財務上謹防詐騙或合夥人的不誠信，仔細查核。"}
  },

  /* ════ 第 38 籤 ════ */
  {
    id:38, title:"第三十八籤 · 順其自然",
    poem:"強求不成莫執著\n緣分天定自有時\n放下執念輕裝行\n順其自然天地寬",
    level:"中吉", category:"中吉籤",
    poem_meaning:"強求不成不要執著，緣分天定自有其時，放下執念輕裝前行，順其自然天地自然寬廣。",
    interpretation:"此籤提示放下執著，順其自然。過度執著反而阻礙事情發展，學會放手，順應自然，緣分到了自然水到渠成，強求只會適得其反。",
    advice:{general:"放下執著，順其自然，緣到自然成，勿強求。",career:"職涯不可過度執著於特定職位，順勢而為。",love:"感情不強求，順其自然才能長久。",health:"放下壓力執著，身體自然放鬆好轉。",wealth:"財富緣分天注定，努力之餘順其自然。"}
  },

  /* ════ 第 39 籤 ════ */
  {
    id:39, title:"第三十九籤 · 步步高升",
    poem:"一步一個腳印深\n步步高升向前行\n穩健踏實是正道\n登高必先從足底",
    level:"大吉", category:"上上籤",
    poem_meaning:"一步一個深深腳印，步步高升向前邁進，穩健踏實才是正道，登高必先從腳底開始。",
    interpretation:"此籤主穩步上升，一步一腳印的踏實努力必換來持續的進步與上升。踏實是最可靠的基石，堅持此道，必然步步高升，成就非凡。",
    advice:{general:"腳踏實地，步步為營，一步一個腳印必步步高升。",career:"工作晉升穩步推進，不求一步到位。",love:"感情穩步增溫，腳踏實地經營，感情深厚。",health:"健康管理循序漸進，每天進步一點。",wealth:"財富穩步積累，每月儲蓄，長期必有大收穫。"}
  },

  /* ════ 第 40 籤 ════ */
  {
    id:40, title:"第四十籤 · 冬去春來",
    poem:"嚴冬終將過去時\n春暖花開好時光\n耐心等候寒冬盡\n溫暖必將再臨身",
    level:"吉", category:"上吉籤",
    poem_meaning:"嚴冬終將過去，春暖花開好時光到來，耐心等候寒冬結束，溫暖必將再次降臨。",
    interpretation:"此籤告示寒冬即將結束，春天即將來臨。目前的困難和寒冷是暫時的，只要耐心等待，溫暖和美好必然再次到來，希望就在不遠處。",
    advice:{general:"寒冬即將過去，耐心等待，春天必然到來。",career:"工作寒冬期即將結束，好機會即將出現。",love:"感情冷淡期即將結束，溫暖即將回歸。",health:"病情即將好轉，繼續配合治療，康復在望。",wealth:"財務困難即將解除，好轉的跡象已出現。"}
  },

  /* ════ 第 41 籤 ════ */
  {
    id:41, title:"第四十一籤 · 一帆風順",
    poem:"風調雨順天時好\n一帆風順萬事吉\n此時順勢大展拳\n好運連連難盡描",
    level:"大吉", category:"上上籤",
    poem_meaning:"風調雨順天時和宜，一帆風順萬事吉祥，此時順勢大展身手，好運連連難以形容。",
    interpretation:"此籤為大吉之兆，天時地利人和皆備，諸事順遂。宜在此好時機積極行動，凡所謀求必能如願，好運連連，萬事皆宜。",
    advice:{general:"天時地利人和皆備，積極行動，萬事皆宜。",career:"工作一帆風順，可積極爭取機會，成功率高。",love:"感情順利，適合求婚或締結良緣的最佳時機。",health:"身心狀態絕佳，適合開始健康新計畫。",wealth:"財運大好，投資創業均順利，可積極進取。"}
  },

  /* ════ 第 42 籤 ════ */
  {
    id:42, title:"第四十二籤 · 忍一時風平",
    poem:"忍一時風平浪靜\n退一步海闊天空\n小不忍則亂大謀\n忍讓之道化干戈",
    level:"平", category:"中平籤",
    poem_meaning:"忍耐一時後風平浪靜，退讓一步後海闊天空，小不忍則亂大謀，忍讓之道化解干戈。",
    interpretation:"此籤提醒以忍讓化解衝突。眼前的摩擦需要以忍耐和退讓來化解，小不忍則亂大謀，暫時退讓並非懦弱，而是大智慧，以和為貴。",
    advice:{general:"忍讓化解衝突，以和為貴，退一步海闊天空。",career:"職場衝突以忍讓化解，不要正面衝突。",love:"感情摩擦以退讓化解，互相包容理解。",health:"情緒衝突影響健康，學習忍讓，平靜身心。",wealth:"商業糾紛以和為貴，忍讓以保長遠利益。"}
  },

  /* ════ 第 43 籤 ════ */
  {
    id:43, title:"第四十三籤 · 披荊斬棘",
    poem:"荊棘叢中劍開路\n艱難险阻不退縮\n越過重重障礙後\n豁然開朗好前途",
    level:"中吉", category:"中吉籤",
    poem_meaning:"荊棘叢中用劍開路，艱難險阻不退縮，越過重重障礙之後，豁然開朗好前途在望。",
    interpretation:"此籤主披荊斬棘，勇往直前。前路雖有重重障礙，但只要有勇氣面對和解決，越過這些障礙之後，前途必然豁然開朗，光明無限。",
    advice:{general:"勇敢面對障礙，披荊斬棘，前途豁然開朗。",career:"工作上有障礙，勇於面對解決，成功在望。",love:"感情有阻礙，勇於溝通解決，關係更進一步。",health:"治療過程辛苦，勇敢面對，康復可期。",wealth:"財務有阻力，積極克服，困境後見光明。"}
  },

  /* ════ 第 44 籤 ════ */
  {
    id:44, title:"第四十四籤 · 莫失良機",
    poem:"千載難逢此良機\n機不可失時不再\n猶豫不決空白費\n把握當下莫遲疑",
    level:"吉", category:"上吉籤",
    poem_meaning:"千載難逢如此良機，機不可失時不再來，猶豫不決只是白白浪費，把握當下不要遲疑。",
    interpretation:"此籤提醒把握難得的好機會。眼前有千載難逢的好機會，機不可失，時不再來，切勿猶豫不決，錯失良機，當斷則斷，積極把握。",
    advice:{general:"千載難逢的機會，當斷則斷，積極把握，勿猶豫。",career:"工作機會難得，立即把握，不要再考慮太久。",love:"難得的緣分機會，勇敢把握，勿讓良緣流失。",health:"健康改善的好時機，立即開始行動。",wealth:"難得的投資機會，分析後若可行立即行動。"}
  },

  /* ════ 第 45 籤 ════ */
  {
    id:45, title:"第四十五籤 · 量力而行",
    poem:"螳臂擋車自不量\n量力而行才明智\n知己知彼方百勝\n過猶不及皆不宜",
    level:"平", category:"中平籤",
    poem_meaning:"螳臂擋車是不自量力，量力而行才是明智，知己知彼方能百戰百勝，過猶不及皆不適宜。",
    interpretation:"此籤提醒量力而行，知己知彼。不可過度高估自己的能力或資源，要清楚了解自己的實力，在能力範圍內行事，避免過度延伸造成失敗。",
    advice:{general:"量力而行，了解自己的能力範圍，不過度延伸。",career:"工作任務要在能力範圍內，不逞強。",love:"感情期望設定合理，不要要求超過對方能力。",health:"運動量力而行，不要超過身體能承受的極限。",wealth:"投資在能力範圍內，不要過度借貸冒險。"}
  },

  /* ════ 第 46 籤 ════ */
  {
    id:46, title:"第四十六籤 · 謙遜有禮",
    poem:"謙謙君子得人心\n禮賢下士眾歸附\n驕兵必敗是定律\n謙遜自牧福自來",
    level:"中吉", category:"中吉籤",
    poem_meaning:"謙遜的君子得人心，禮賢下士眾人歸附，驕兵必敗是定律，謙遜修身福氣自來。",
    interpretation:"此籤主謙遜待人，禮賢下士。謙遜是美德，能得人心；驕傲自大只會招致失敗。保持謙遜的態度，廣結善緣，福報自然而來。",
    advice:{general:"謙遜待人，廣結善緣，驕傲自大必招失敗。",career:"職場保持謙遜，禮敬同仁，貴人自然相助。",love:"感情中謙讓體貼，不要傲慢，更易得對方芳心。",health:"謙遜接受醫護建議，不要自以為是。",wealth:"商業謙遜合作，不要驕傲自大，合則兩利。"}
  },

  /* ════ 第 47 籤 ════ */
  {
    id:47, title:"第四十七籤 · 三人行",
    poem:"三人行必有我師\n學無止境廣涉獵\n虛心請益長見識\n他山之石可攻玉",
    level:"中吉", category:"中吉籤",
    poem_meaning:"三人同行必有可以學習之人，學習無止境廣泛涉獵，虛心請益增長見識，他山之石可以攻玉。",
    interpretation:"此籤主學習進取，虛心求教。近期有好的學習機會和智慧的師長指引，宜虛心求教，廣泛學習，他山之石可以攻玉，開放心胸接受新知。",
    advice:{general:"虛心學習，廣涉獵，他山之石可以攻玉。",career:"職場虛心向前輩學習，廣泛涉獵提升能力。",love:"感情中互相學習成長，包容彼此的不同。",health:"虛心聽取健康建議，學習正確保健知識。",wealth:"學習理財知識，廣泛了解投資知識。"}
  },

  /* ════ 第 48 籤 ════ */
  {
    id:48, title:"第四十八籤 · 磨刀不誤功",
    poem:"磨刀不誤砍柴工\n準備充分事半功\n凡事謀而後動好\n預則立之廢則誤",
    level:"平", category:"中平籤",
    poem_meaning:"磨刀不誤砍柴功，充分準備事半功倍，凡事謀而後動比較好，有所預備立，無所預備廢。",
    interpretation:"此籤提示充分準備再行動。花時間準備和計畫並不是浪費，而是讓後續行動更有效率。充分準備，謀而後動，才能事半功倍。",
    advice:{general:"充分準備再行動，謀而後動，事半功倍。",career:"工作前做好充分規劃準備，執行才順利。",love:"感情要認真準備，了解對方才能走得長久。",health:"健康計畫充分準備，才能有效執行。",wealth:"投資前做好充分研究，再做決定。"}
  },

  /* ════ 第 49 籤 ════ */
  {
    id:49, title:"第四十九籤 · 逢凶化吉",
    poem:"凶兆臨門莫驚慌\n鎮定從容應對之\n逢凶必能化為吉\n危中有機智者得",
    level:"凶", category:"下籤",
    poem_meaning:"凶兆來臨不要驚慌，鎮定從容應對，逢凶必能轉化為吉，危機中有機會智者得之。",
    interpretation:"此籤雖凶但有化解之道。面對不利的情況，鎮定從容是化解之道，保持冷靜理性，危機中找到轉機，逢凶化吉，智慧應對必見轉機。",
    advice:{general:"遇凶不慌，鎮定應對，逢凶化吉，危中有機。",career:"工作危機用冷靜智慧應對，逢凶化吉。",love:"感情危機冷靜處理，轉機在危機中。",health:"病情有危，積極冷靜配合治療，逢凶化吉。",wealth:"財務危機冷靜分析，找到解決方案。"}
  },

  /* ════ 第 50 籤 ════ */
  {
    id:50, title:"第五十籤 · 天道輪迴",
    poem:"善惡終有報應來\n天道輪迴公道在\n行善積德積福德\n惡因種下惡果生",
    level:"平", category:"中平籤",
    poem_meaning:"善惡終有報應，天道輪迴公正，行善積德積累福德，惡因種下必生惡果。",
    interpretation:"此籤提醒因果輪迴，善惡有報。凡事以善心行事，積累善因，必得善果；若有虧心事，及早修正彌補。天道輪迴，公道自在人心。",
    advice:{general:"行善積德，因果循環，修善積德福自來。",career:"工作中保持誠信正道，善因必得善果。",love:"感情以真誠善意對待，真心換真情。",health:"身心健康與品德修養相關，行善身心自然和。",wealth:"財富以正當道德方式獲取，長久且安穩。"}
  },

  /* ════ 第 51 籤 ════ */
  {
    id:51, title:"第五十一籤 · 鴻雁傳書",
    poem:"千里鴻雁傳信來\n遠方佳音即到來\n他鄉好友有消息\n天涯相隔情義長",
    level:"吉", category:"上吉籤",
    poem_meaning:"千里鴻雁傳來書信，遠方好消息即將到來，異鄉好友有消息，天涯相隔情義長存。",
    interpretation:"此籤主遠方有好消息將至，或有遠方友人聯繫。近期可能收到久別友人的消息，或遠方的事業、感情有好消息，保持通訊，好訊息即將到來。",
    advice:{general:"期待遠方好消息，與遠方親友保持聯繫。",career:"遠方合作或出差機會可能來臨，把握機會。",love:"遠距離感情有好消息，或異地戀有所進展。",health:"外地求醫或有好的醫療資訊到來。",wealth:"遠方的投資或商業機會即將有好消息。"}
  },

  /* ════ 第 52 籤 ════ */
  {
    id:52, title:"第五十二籤 · 大器晚成",
    poem:"大器晚成莫心急\n千里之行始足下\n時機成熟自顯現\n磁針慢轉指北方",
    level:"中吉", category:"中吉籤",
    poem_meaning:"大器晚成不要心急，千里之行從腳下開始，時機成熟自然顯現，磁針慢慢轉向正確方向。",
    interpretation:"此籤主大器晚成，不可心急。許多偉大的成就都需要時間醞釀，目前可能看不到明顯成果，但只要方向正確，時機成熟自然顯現，大器終將成。",
    advice:{general:"不心急，大器晚成，方向正確終將顯現成果。",career:"事業發展需時間，不急於一時，持續努力。",love:"感情慢慢培養，大器晚成，急不來的。",health:"慢性病需長期調理，不急於求成，持之以恆。",wealth:"財富需要時間積累，不要急躁，大器晚成。"}
  },

  /* ════ 第 53 籤 ════ */
  {
    id:53, title:"第五十三籤 · 自強不息",
    poem:"天行健君子以自強\n不息進取莫停歇\n自助而後天助之\n奮發圖強創未來",
    level:"中吉", category:"中吉籤",
    poem_meaning:"天道剛健，君子以此自強不息，不休止進取，自助而後天助，奮發圖強創造未來。",
    interpretation:"此籤主自強不息，天助自助者。不要等待他人幫助，先自強自立，發憤圖強，天道自助者，自強才能得天助，創造屬於自己的美好未來。",
    advice:{general:"自強不息，天助自助者，奮發圖強創造未來。",career:"主動精進自我能力，天助自助者。",love:"提升自己，自強者自然吸引好的對象。",health:"積極保健自強，身體是自己的，要主動維護。",wealth:"主動學習理財，自強者財富自然增長。"}
  },

  /* ════ 第 54 籤 ════ */
  {
    id:54, title:"第五十四籤 · 謹防破財",
    poem:"破財消災是古訓\n財去人安莫悲傷\n謹慎理財防漏財\n守住錢財是正道",
    level:"凶", category:"下籤",
    poem_meaning:"破財消災是古老訓示，財去人安不要悲傷，謹慎理財防止漏財，守住財富才是正道。",
    interpretation:"此籤提醒謹防財務損失。近期財運不佳，可能有意外支出或財務損失，需謹慎理財，避免不必要的消費，守住財富，破財消災可保平安。",
    advice:{general:"謹防破財，謹慎理財，守住財富，破財消災。",career:"工作上謹防合約或金錢糾紛，仔細查核。",love:"感情中謹防因財務引起的摩擦和紛爭。",health:"謹防意外或突然的醫療支出，提前準備。",wealth:"近期財運不佳，保守理財，謹防損失。"}
  },

  /* ════ 第 55 籤 ════ */
  {
    id:55, title:"第五十五籤 · 明月幾時有",
    poem:"明月千里寄相思\n天涯共此一輪月\n思念之情深似海\n緣份終使人相聚",
    level:"吉", category:"上吉籤",
    poem_meaning:"明月千里寄託相思，天涯共享同一輪月，思念之情深如大海，緣份終究使人相聚。",
    interpretation:"此籤主思念與重逢。久別的友人或愛人即將重逢，或思念之人有消息，緣分未盡，分別只是暫時，重逢在即，好消息即將到來。",
    advice:{general:"緣分未盡，重逢在即，思念之人即將再相見。",career:"久別的合作夥伴或客戶可能重新聯繫。",love:"分離的戀人可望重逢，緣分未盡。",health:"遠方就醫或療養可能帶來好效果。",wealth:"久未聯繫的商業夥伴可能帶來新機遇。"}
  },

  /* ════ 第 56 籤 ════ */
  {
    id:56, title:"第五十六籤 · 千金難買",
    poem:"千金難買少年時\n珍惜光陰勿蹉跎\n歲月如梭不等人\n把握當下最重要",
    level:"平", category:"中平籤",
    poem_meaning:"千金難買少年時光，珍惜光陰不要蹉跎，歲月如梭不等人，把握當下最為重要。",
    interpretation:"此籤提醒珍惜時光。時間是最寶貴的資源，一去不復返，不要蹉跎歲月，把握現在的每一天，積極生活，珍惜時光，不要讓時間白白流逝。",
    advice:{general:"珍惜時光，把握當下，歲月如梭，勿蹉跎。",career:"把握當前的工作機會，不要拖延行動。",love:"珍惜現在的感情，不要因懈怠而失去。",health:"趁年輕保持健康，不要等老了才後悔。",wealth:"越早開始理財越好，時間是複利的朋友。"}
  },

  /* ════ 第 57 籤 ════ */
  {
    id:57, title:"第五十七籤 · 福星高照",
    poem:"福星高照運氣旺\n諸事順遂心想成\n好運連連不間斷\n幸福就在眼前方",
    level:"大吉", category:"上上籤",
    poem_meaning:"福星高照運氣旺盛，諸事順遂心想事成，好運連連不間斷，幸福就在眼前。",
    interpretation:"此籤為大吉之兆，福星高照，好運連連。近期運勢極佳，諸事如意，心想事成，宜積極行動，把握此好運時期，凡所求必能如願以償。",
    advice:{general:"福星照耀，運勢大好，積極行動，心想事成。",career:"工作運勢極佳，積極爭取機會，成功率高。",love:"感情好運連連，求婚表白皆大吉。",health:"身心狀態絕佳，好好珍惜健康。",wealth:"財運亨通，投資理財均順利。"}
  },

  /* ════ 第 58 籤 ════ */
  {
    id:58, title:"第五十八籤 · 日進千里",
    poem:"馬到成功功業立\n一日千里進步快\n才能施展無阻礙\n前途無量自光明",
    level:"大吉", category:"上上籤",
    poem_meaning:"馬到成功功業建立，一日千里進步神速，才能施展無阻礙，前途無量自然光明。",
    interpretation:"此籤主才能大展，進步神速。此時是個人能力和才華最容易得到發揮和認可的時期，進步迅速，前途無量，宜積極出擊，建功立業。",
    advice:{general:"才能大展之時，積極出擊，進步神速，建功立業。",career:"能力受到認可，大好機會到來，積極爭取。",love:"感情進展神速，適合快速推進關係。",health:"健康狀態很好，適合積極鍛鍊提升體能。",wealth:"財富增長快速，投資有高回報。"}
  },

  /* ════ 第 59 籤 ════ */
  {
    id:59, title:"第五十九籤 · 轉危為安",
    poem:"危機四伏險象環\n轉危為安靠智慧\n冷靜分析找出路\n柳暗花明轉機至",
    level:"凶", category:"下籤",
    poem_meaning:"危機四伏險象環生，轉危為安靠智慧，冷靜分析找出路，柳暗花明轉機到來。",
    interpretation:"此籤雖凶，但強調以智慧轉危為安。危機中保持冷靜，智慧分析，必能找到出路，轉危為安。關鍵在於不慌亂，用智慧解決問題。",
    advice:{general:"危機用智慧化解，冷靜分析，轉危為安。",career:"工作危機冷靜面對，智慧應對，必能化險為夷。",love:"感情危機冷靜處理，用智慧溝通解決。",health:"病情危急，立即尋求最好的醫療，不要拖延。",wealth:"財務危機冷靜分析，尋求專業建議解決。"}
  },

  /* ════ 第 60 籤 ════ */
  {
    id:60, title:"第六十籤 · 圓滿終成",
    poem:"走過風雨見彩虹\n圓滿人生笑顏開\n起點終點皆相連\n善始善終是福源",
    level:"大吉", category:"上上籤",
    poem_meaning:"走過風雨見到彩虹，圓滿人生笑顏大開，起點與終點皆相連，善始善終是福氣的源泉。",
    interpretation:"此籤為第六十籤，象徵圓滿完結，善始善終。人生一個循環即將圓滿完成，積累的善因善行將結出圓滿的果實，諸事皆善，福氣綿延不絕。",
    advice:{general:"圓滿終成，善始善終，人生一個美好循環完結。",career:"事業告一段落圓滿，新的開始即將展開。",love:"感情圓滿，適合為關係下一個美好的定義。",health:"健康調養圓滿，身體整體狀態達到平衡。",wealth:"財富積累到一個里程碑，圓滿達成目標。"}
  }

];
/* ── 八字計算引擎 ── */
const STEMS   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCH  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const S_EL    = ['木','木','火','火','土','土','金','金','水','水'];
const B_EL    = ['水','土','木','木','土','火','火','土','金','金','土','水'];
const ANIMALS = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'];
const SHI_CHEN= [
  {name:'子時',range:'23:00–01:00',branch:0},
  {name:'丑時',range:'01:00–03:00',branch:1},
  {name:'寅時',range:'03:00–05:00',branch:2},
  {name:'卯時',range:'05:00–07:00',branch:3},
  {name:'辰時',range:'07:00–09:00',branch:4},
  {name:'巳時',range:'09:00–11:00',branch:5},
  {name:'午時',range:'11:00–13:00',branch:6},
  {name:'未時',range:'13:00–15:00',branch:7},
  {name:'申時',range:'15:00–17:00',branch:8},
  {name:'酉時',range:'17:00–19:00',branch:9},
  {name:'戌時',range:'19:00–21:00',branch:10},
  {name:'亥時',range:'21:00–23:00',branch:11},
];

function dateToJDN(y,m,d){
  const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}

function calcBaZi(year,month,day,hour){
  /* 年柱 — 立春(≈2/4)前屬上一年；與月支節氣邊界一致 */
  let by=year;
  if(month<2||(month===2&&day<4)) by--;
  const ySi=(by-4+400)%10, yBi=(by-4+4800)%12;

  /* 月柱 — 依節氣交界日取月支，非單純曆月 */
  // [節氣日(近似), 節前月支, 節後月支]
  // 小寒(1/6)→丑, 立春(2/4)→寅, 驚蟄(3/6)→卯, 清明(4/5)→辰
  // 立夏(5/6)→巳, 芒種(6/6)→午, 小暑(7/7)→未, 立秋(8/7)→申
  // 白露(9/8)→酉, 寒露(10/8)→戌, 立冬(11/7)→亥, 大雪(12/7)→子
  const MONTH_ST=[
    [6, 0, 1],[4, 1, 2],[6, 2, 3],[5, 3, 4],
    [6, 4, 5],[6, 5, 6],[7, 6, 7],[7, 7, 8],
    [8, 8, 9],[8, 9,10],[7,10,11],[7,11, 0],
  ];
  const [stDay,brBefore,brAfter]=MONTH_ST[month-1];
  const mBi=day<stDay?brBefore:brAfter;
  const mBase=[2,4,6,8,0][ySi%5];
  const mSi=((mBase+(mBi-2+12)%12)%10+10)%10;

  /* 日柱 — 參考 2000/1/1=戊午(4,6) */
  const jdn=dateToJDN(year,month,day), diff=jdn-2451545;
  const dSi=((4+diff)%10+10)%10, dBi=((6+diff)%12+12)%12;

  /* 時柱 */
  const hBi=hour===23?0:Math.floor((hour+1)/2)%12;
  const hBase=[0,2,4,6,8][dSi%5];
  const hSi=(hBase+hBi)%10;

  return {
    year :{s:STEMS[ySi],b:BRANCH[yBi],si:ySi,bi:yBi},
    month:{s:STEMS[mSi],b:BRANCH[mBi],si:mSi,bi:mBi},
    day  :{s:STEMS[dSi],b:BRANCH[dBi],si:dSi,bi:dBi},
    hour :{s:STEMS[hSi],b:BRANCH[hBi],si:hSi,bi:hBi},
  };
}

function calcElements(bz){
  const c={木:0,火:0,土:0,金:0,水:0};
  ['year','month','day','hour'].forEach(p=>{
    c[S_EL[bz[p].si]]++;
    c[B_EL[bz[p].bi]]++;
  });
  return c;
}

const DM_DATA=[
  {n:'甲木',d:'甲木日主，性格剛直，積極進取，有領袖風範，追求名利，主意強，喜支配他人。',t:['積極主動','正直不阿','善於規劃']},
  {n:'乙木',d:'乙木日主，溫柔細膩，適應力強，善於周旋，具藝術感，柔中帶韌。',t:['靈活變通','親和力強','藝術感佳']},
  {n:'丙火',d:'丙火日主，熱情外向，光明磊落，具感召力，慷慨大方，樂觀開朗。',t:['熱情開朗','樂於助人','領導力強']},
  {n:'丁火',d:'丁火日主，溫暖細心，才華洋溢，重情重義，有藝術天分，心思細膩。',t:['心思細膩','才華橫溢','重情義']},
  {n:'戊土',d:'戊土日主，穩重踏實，值得信賴，有包容之心，意志堅定，保守穩健。',t:['穩重可靠','寬宏大量','意志堅定']},
  {n:'己土',d:'己土日主，謹慎保守，內斂低調，善於理財，細心踏實，務實可靠。',t:['謹慎細心','務實踏實','善理財']},
  {n:'庚金',d:'庚金日主，剛毅果決，正義感強，行動力十足，武勇豪爽，不拘小節。',t:['果決勇敢','正義感強','行動力強']},
  {n:'辛金',d:'辛金日主，聰明機智，注重形象，追求完美，審美獨特，才思敏捷。',t:['聰明敏銳','注重品質','審美佳']},
  {n:'壬水',d:'壬水日主，思想開明，智慧過人，善於溝通，豁達大度，多才多藝。',t:['思維開闊','智慧聰穎','善溝通']},
  {n:'癸水',d:'癸水日主，敏感直覺強，富想像力與創造力，情感豐富，細膩體貼。',t:['直覺敏銳','富創造力','情感豐富']},
];

/* ══════════════════════════════════════════════════
   命格 MING GE — 月支取格
══════════════════════════════════════════════════ */

/* 月支藏干（本氣為首） — 索引對應 STEMS */
const BRANCH_HIDDEN=[
  [8],       // 子: 壬
  [5,9,7],   // 丑: 己,癸,辛
  [0,2,4],   // 寅: 甲,丙,戊
  [1],       // 卯: 乙
  [4,1,9],   // 辰: 戊,乙,癸
  [2,6,4],   // 巳: 丙,庚,戊
  [3,5],     // 午: 丁,己
  [5,3,1],   // 未: 己,丁,乙
  [6,8,4],   // 申: 庚,壬,戊
  [7],       // 酉: 辛
  [4,7,3],   // 戌: 戊,辛,丁
  [8,0],     // 亥: 壬,甲
];

/* 十神計算 */
function getTenGod(daySi, stemSi){
  const dEl=daySi>>1, sEl=stemSi>>1;
  const sameYY=(daySi%2)===(stemSi%2);
  if(dEl===sEl)               return sameYY?'比肩':'劫財';
  if((dEl+1)%5===sEl)         return sameYY?'食神':'傷官';
  if((sEl+1)%5===dEl)         return sameYY?'偏印':'正印';
  if((dEl+2)%5===sEl)         return sameYY?'偏財':'正財';
  if((sEl+2)%5===dEl)         return sameYY?'七殺':'正官';
}

/* 十神 → 格局名 */
const TENGOD_TO_GEGE={
  '正官':'正官格','七殺':'七殺格','正印':'正印格','偏印':'偏印格',
  '正財':'正財格','偏財':'偏財格','食神':'食神格','傷官':'傷官格',
  '比肩':'建祿格','劫財':'羊刃格',
};

/* 格局詳細資料 */
const GEGE_DATA={
  '正官格':{
    icon:'⚖️', alias:'官貴格', type:'正格', badge:'zhen',
    typeLabel:'八正格 · 官星',
    summary:'正官格月支本氣為正官，代表受社會規範約束的正統力量。此格命主多半端正守法，具名望地位，在體制內發展如魚得水，官運自然亨通。',
    traits:['守法重義','沉穩自持','注重形象','責任感強','講究規矩','品行端正'],
    strength:{t:'格局優勢',v:'社會地位穩固，受人尊重，做事有條理，升遷有望，適合在體制內循序漸進地發展，晚年多有顯赫成就。'},
    caution:{t:'注意事項',v:'過於保守，有時因求穩而錯失良機。過度在意面子與形象，需防委屈自己迎合他人期待。'},
    love:{t:'感情特質',v:'重視承諾與婚姻穩定，不喜花心，對伴侶忠誠，是顧家型的伴侶，感情生活安穩踏實。'},
    career:'公職、法律、司法、管理階層、教育、金融、醫療、外交',
    advice:'發揮守正持中之德，在體制內善用規則，循規蹈矩，可得顯赫地位與名聲。',
  },
  '七殺格':{
    icon:'⚔️', alias:'偏官格', type:'偏格', badge:'pian',
    typeLabel:'八正格 · 殺星',
    summary:'七殺格月支本氣為七殺（偏官），具強烈的衝擊與制克之力。此格命主個性剛強果決，行動力十足，充滿魄力，能在逆境中奮起，遇強則強。',
    traits:['果敢剛強','行動迅速','不畏挑戰','意志堅定','威嚴攝人','衝勁十足'],
    strength:{t:'格局優勢',v:'意志超強，逆境中愈挫愈勇，做事雷厲風行，具強大執行力與領導魅力，能成就一番大事業。'},
    caution:{t:'注意事項',v:'脾氣急躁，容易與人起衝突，做事衝動欠思考。七殺無制最忌，需有印星化殺，方能化煞為權。'},
    love:{t:'感情特質',v:'感情熱烈，愛恨分明，但因個性強勢，易使關係緊張。需找包容度強的伴侶，學習柔軟相處之道。'},
    career:'軍警、創業家、外科醫師、體育競技、競爭性行業、危機管理',
    advice:'以制化之法馴服殺氣（印化殺、食制殺），將強烈能量導向正途，可成一代梟雄。',
  },
  '正印格':{
    icon:'📚', alias:'印綬格', type:'正格', badge:'zhen',
    typeLabel:'八正格 · 印星',
    summary:'正印格月支本氣為正印，代表學識、智慧與長輩庇蔭。此格命主品格高尚，才思縝密，重視文化教育，貴人助力多，走清貴之路最為順遂。',
    traits:['學識豐富','仁慈厚道','思維縝密','重視文化','智慧過人','品格高尚'],
    strength:{t:'格局優勢',v:'心思縝密，善於學習精進，容易獲得長輩貴人青睞，品格高尚，多有清貴之氣，適合走學術文化路線。'},
    caution:{t:'注意事項',v:'行動力偏弱，思慮過多反而優柔寡斷，有時依賴心過重，需培養獨立果斷的執行能力。'},
    love:{t:'感情特質',v:'感情細膩，體貼入微，善解人意。但有時過於理想化，需接受伴侶的不完美，給感情更多現實空間。'},
    career:'學術研究、教育、出版、文化、宗教、顧問、心理諮商、政策制定',
    advice:'善用智識與人脈，持續學習精進，走文教清貴之路，以智慧與品德服人，功名水到渠成。',
  },
  '偏印格':{
    icon:'🔮', alias:'梟神格', type:'偏格', badge:'pian',
    typeLabel:'八正格 · 梟神',
    summary:'偏印格月支本氣為偏印，又稱梟神，具強烈的獨特性與神秘氣質。此格命主思維跳脫常規，藝術才華突出，直覺超強，往往走出與眾不同的人生道路。',
    traits:['思維獨特','藝術天分','直覺敏銳','神秘色彩','孤僻個性','創意豐富'],
    strength:{t:'格局優勢',v:'創意豐富，直覺超強，善於獨立思考，在藝術創作、研究或玄學領域能有突破性的傑出成就。'},
    caution:{t:'注意事項',v:'處事飄忽，難以持久，易走偏門，人際關係疏離。梟神奪食需特別留意，謀事可能不順，需防計劃半途而廢。'},
    love:{t:'感情特質',v:'感情較為疏離，不善於直接表達情感，需要能讀懂自己內心的伴侶，給彼此足夠的空間才能維持關係。'},
    career:'藝術創作、設計、心理研究、玄學命理、獨立研究、創意產業、電影導演',
    advice:'發揮超凡的創造力與直覺，找到屬於自己的獨特舞台，不隨波逐流，以奇思妙想開創一條少有人走的路。',
  },
  '正財格':{
    icon:'💎', alias:'正財格', type:'正格', badge:'zhen',
    typeLabel:'八正格 · 財星',
    summary:'正財格月支本氣為正財，代表踏實勤勞所換取的財富。此格命主做事勤奮節儉，理財能力出色，以腳踏實地的方式一點一滴積累財富，晚年多有積蓄。',
    traits:['勤勞踏實','節儉理財','誠信務實','腳踏實地','重視物質','信用良好'],
    strength:{t:'格局優勢',v:'善於累積財富，做事穩健踏實，信用良好，能吃苦耐勞，不輕易冒進，長期努力之下財運豐厚。'},
    caution:{t:'注意事項',v:'保守過度，過於計較得失，視野偏窄，難以看到更大的格局與機會，需適時放開手腳，拓展視野。'},
    love:{t:'感情特質',v:'重視物質基礎與家庭責任，感情穩定，對家人負責，是顧家好伴侶，但有時過於現實，需注重情感交流。'},
    career:'財務管理、會計、銀行、零售商業、不動產、農業、餐飲、製造業',
    advice:'以勤儉之道積累財富，穩紮穩打，長遠規劃財務，避免投機取巧，厚積薄發財源廣進。',
  },
  '偏財格':{
    icon:'💫', alias:'偏財格', type:'偏格', badge:'pian',
    typeLabel:'八正格 · 財星',
    summary:'偏財格月支本氣為偏財，代表流動活躍的財氣。此格命主慷慨大方，交際廣闊，善走偏門財路，能在商業活動中左右逢源，財路廣泛但也來去如風。',
    traits:['慷慨大方','交際廣闊','樂天豁達','財來財去','人緣極佳','靈活善變'],
    strength:{t:'格局優勢',v:'人緣廣，財路多元，善於把握機會，在貿易、業務、投資等流動性高的領域中，能快速累積資源與財富。'},
    caution:{t:'注意事項',v:'財來財去難以積累，貪多嚼不爛。需防過度投機失敗，或因過於慷慨助人而散盡積蓄，理財需有節制。'},
    love:{t:'感情特質',v:'桃花旺盛，感情豐富活躍，異性緣極佳，但也因此容易多情，感情生活較複雜，需注意專一度。'},
    career:'貿易、業務銷售、投資理財、娛樂產業、仲介、自由業、跨國商業',
    advice:'善用廣闊人脈與靈活頭腦把握商機，同時節制消費與投機，建立長期積累的理財習慣，方能守住財富。',
  },
  '食神格':{
    icon:'🌸', alias:'壽星格', type:'正格', badge:'zhen',
    typeLabel:'八正格 · 食神',
    summary:'食神格月支本氣為食神，被稱為最有福氣的格局之一，代表生活享受、才藝豐富與口福。此格命主溫厚和善，生活品味佳，福壽雙全，廣受人緣。',
    traits:['溫厚和善','才藝多元','享受生活','樂觀豁達','口才出眾','廣結善緣'],
    strength:{t:'格局優勢',v:'生活品味佳，才藝豐富，福祿深厚，為人慷慨，善於享受人生，與人相處融洽，貴人緣極好。'},
    caution:{t:'注意事項',v:'容易安於現狀，缺乏衝勁與企圖心，有時過於享樂而忽略目標。若命局中出現梟神奪食，則需特別留意健康與謀事不順。'},
    love:{t:'感情特質',v:'感情溫和體貼，善於表達愛意，重視家庭生活品質，家庭幸福，是貼心溫暖的伴侶。'},
    career:'餐飲美食、藝術創作、文創設計、教育兒童、演藝娛樂、美食評論、生活風格',
    advice:'把握天生的福星之氣，以才藝與熱情創造事業，享受豐盛美好的人生，善用口才與才藝廣結善緣。',
  },
  '傷官格':{
    icon:'⚡', alias:'傷官格', type:'偏格', badge:'pian',
    typeLabel:'八正格 · 傷官',
    summary:'傷官格月支本氣為傷官，是才華最為橫溢的格局。此格命主個性獨特，不甘受拘束，充滿創造力與批判性思維，在藝術或技術領域往往有驚人成就。',
    traits:['才華洋溢','不拘禮法','創意十足','批判思維','追求完美','個性鮮明'],
    strength:{t:'格局優勢',v:'創造力驚人，才氣縱橫，在藝術創作或技術研發領域能有傑出突破，思想超前時代，是天才型人物。'},
    caution:{t:'注意事項',v:'傷官見官最忌，易與上司長輩起衝突，不服管教，官場仕途不順。感情也易有波折，言語銳利需留意。'},
    love:{t:'感情特質',v:'感情熱情奔放，才情十足令人傾心，但個性強烈，需要包容度極高、能欣賞自己才華的伴侶相伴。'},
    career:'藝術創作、音樂、設計、創業、科技創新、律師辯護、演講、批評評論',
    advice:'找到能充分發揮才華的舞台，遠離不適合自己的體制束縛，以創意、技術與個人魅力征服世界。',
  },
  '建祿格':{
    icon:'🏛️', alias:'祿元格', type:'特殊格', badge:'special',
    typeLabel:'特殊格 · 比肩',
    summary:'建祿格月支為日主同陰陽之比肩，日主得月令強旺，代表自立自強的旺盛生命力。此格命主不依賴他人，憑一己之力獨當一面，拼搏精神強。',
    traits:['自立自強','意志堅定','獨當一面','責任感強','不依賴他人','硬骨頭'],
    strength:{t:'格局優勢',v:'日主旺盛，意志堅定，能獨立克服困難，自我奮鬥能力強，靠自己打拼出一片天地，耐力與抗壓性極強。'},
    caution:{t:'注意事項',v:'過於自信，不善求助，有時固執己見，孤軍奮戰。比劫重則有爭財之象，需防合夥紛爭或被奪財。'},
    love:{t:'感情特質',v:'感情中較為主導，習慣以自己為中心，需學習包容與尊重對方意見，給伴侶留有空間。'},
    career:'自由業、自主創業、管理職、軍警、運動員、藝術家、獨立工作者',
    advice:'發揮強大的自主能力，以自身的努力與韌勁開創事業，廣結人脈彌補孤軍之弱，勿孤芳自賞。',
  },
  '羊刃格':{
    icon:'🗡️', alias:'月刃格', type:'特殊格', badge:'special',
    typeLabel:'特殊格 · 劫財',
    summary:'羊刃格月支為日主劫財，日主氣勢極旺，刃氣逼人，個性剛強果決，競爭意識強烈，充滿戰鬥力，是最具爆發力的格局之一。',
    traits:['剛強果決','競爭意識強','不服輸','爆發力強','行動迅速','耐力過人'],
    strength:{t:'格局優勢',v:'體力充沛，意志力超強，能在競爭激烈的環境中脫穎而出，逆境中愈戰愈勇，有強烈的制勝欲望。'},
    caution:{t:'注意事項',v:'性格強悍，易與人起衝突，感情多波折。刃氣過旺無制則傷身傷人，需以官殺制刃或食傷洩刃方得平衡。'},
    love:{t:'感情特質',v:'感情激烈，愛憎分明，感情生活波折較多，需尋找個性成熟、能柔化強刃之氣的伴侶。'},
    career:'軍警武職、外科手術、競技運動、創業衝刺、競爭性行業、危機應對',
    advice:'借官殺制刃之力，將強烈的刃氣轉化為成就大事業的驅動力，找到能駕馭強旺之氣的人生舞台。',
  },
};

/* 取格函數 */
function getMingGe(bz){
  const daySi=bz.day.si;
  const monthBi=bz.month.bi;
  const mainStemSi=BRANCH_HIDDEN[monthBi][0]; // 月支本氣
  const tenGod=getTenGod(daySi, mainStemSi);
  const geName=TENGOD_TO_GEGE[tenGod]||'建祿格';
  const data=GEGE_DATA[geName]||GEGE_DATA['建祿格'];

  // 所有藏干及其十神（用於顯示藏干列表）
  const allHidden=BRANCH_HIDDEN[monthBi].map(si=>({
    stem:STEMS[si], tg:getTenGod(daySi,si)
  }));

  return {geName, tenGod, mainStemSi, data, allHidden};
}

/* 渲染命格 */
function renderMingGe(bz){
  const {geName, tenGod, mainStemSi, data, allHidden}=getMingGe(bz);

  // Derivation chain
  const monthBranch=bz.month.b;
  const mainStem=STEMS[mainStemSi];
  const dayStem=bz.day.s;
  const allHiddenHtml=allHidden.map((h,i)=>{
    const isMaster=(i===0);
    return `<span class="node${isMaster?' hl':''}">${h.stem}（${h.tg}）${isMaster?'<sup style="font-size:0.6em;margin-left:2px;color:var(--gold-dim)">本氣</sup>':''}</span>`;
  }).join('<span class="arr">·</span>');

  document.getElementById('gegeDeriveChain').innerHTML=
    `月支 <span class="node">${monthBranch}</span>
     <span class="arr">→</span> 藏干 ${allHiddenHtml}
     <span class="arr">→</span> 日主 <span class="node">${dayStem}</span> 之 <span class="node hl">${tenGod}</span>
     <span class="arr">→</span> <span class="node hl">【${geName}】</span>`;

  // Banner
  document.getElementById('gegeIcon').textContent=data.icon;
  document.getElementById('gegeName').textContent=geName;
  const typeBadgeHtml=`<span class="gege-badge ${data.badge}">${data.type}</span><span class="gege-badge type">${data.typeLabel}</span>`;
  document.getElementById('gegeBadges').innerHTML=typeBadgeHtml;

  // Summary
  document.getElementById('gegeSummary').textContent=data.summary;

  // Traits
  document.getElementById('gegeTraits').innerHTML=data.traits.map(t=>`<span class="trait-tag">${t}</span>`).join('');

  // Three boxes
  const boxes=[
    {cls:'strength', t:data.strength.t, v:data.strength.v},
    {cls:'caution',  t:data.caution.t,  v:data.caution.v},
    {cls:'love',     t:data.love.t,     v:data.love.v},
  ];
  document.getElementById('gegeBoxes').innerHTML=boxes.map(b=>`
    <div class="gege-box ${b.cls}">
      <div class="gege-box-ttl">${b.t}</div>
      ${b.v}
    </div>`).join('');

  // Career
  document.getElementById('gegeCareer').innerHTML=`
    <div class="gege-career-icon">💼</div>
    <div class="gege-career-body">
      <div class="gege-career-ttl">適合職業方向</div>
      <div class="gege-career-txt">${data.career}</div>
    </div>`;

  // Advice
  document.getElementById('gegeAdvice').textContent=data.advice;
}

function getGejuAnalysis(bz,elCounts){
  const dayEl=S_EL[bz.day.si];
  const max=Object.entries(elCounts).sort((a,b)=>b[1]-a[1])[0];
  const min=Object.entries(elCounts).sort((a,b)=>a[1]-b[1])[0];
  const total=Object.values(elCounts).reduce((a,b)=>a+b,0);
  const pct=e=>Math.round(elCounts[e]/total*100);

  let text=`日主為「${bz.day.s}（${dayEl}）」，`;
  text+=`命盤中「${max[0]}」最旺（佔${pct(max[0])}%），「${min[0]}」最弱（佔${pct(min[0])}%）。`;

  if(pct(dayEl)>=30) text+=' 日主強旺，宜洩耗之神為用，事業宜發揮自身才能。';
  else if(pct(dayEl)<=12) text+=' 日主偏弱，宜生扶印比為用，宜借外力提升自身能量。';
  else text+=' 日主中和，宜按需求靈活調配，五行較為平衡。';

  return text;
}


/* ══════════════════════════════════════════════════
   EXTENDED ANALYSIS — 用神 / 六親 / 面向 / 補運
══════════════════════════════════════════════════ */

/* 五行 → 顏色/方位/數字/職業 速查 */
const EL_DETAIL={
  木:{color:'綠色、青色',dir:'東方',num:'3、8',career:'文教、文創、醫療、農林',season:'春',organ:'肝膽'},
  火:{color:'紅色、紫色、橙色',dir:'南方',num:'2、7',career:'傳媒、娛樂、電子、餐飲',season:'夏',organ:'心臟、血液'},
  土:{color:'黃色、棕色、米色',dir:'中央',num:'5、10',career:'地產、金融、建築、農業',season:'四季末',organ:'脾胃'},
  金:{color:'白色、金色、銀色',dir:'西方',num:'4、9',career:'法律、金融、機械、科技',season:'秋',organ:'肺、皮膚'},
  水:{color:'黑色、深藍、靛色',dir:'北方',num:'1、6',career:'貿易、哲學、藝術、情報',season:'冬',organ:'腎、膀胱'},
};

/* 天干相剋對照 */
const STEM_CONQUER={'甲':'庚','乙':'辛','丙':'壬','丁':'癸','戊':'甲','己':'乙','庚':'丙','辛':'丁','壬':'戊','癸':'己'};
const STEM_BEGET=  {'甲':'丙','乙':'丁','丙':'戊','丁':'己','戊':'庚','己':'辛','庚':'壬','辛':'癸','壬':'甲','癸':'乙'};

/* 日主強弱判斷 */
function getDmStrength(bz,el){
  const dayEl=S_EL[bz.day.si];
  const total=Object.values(el).reduce((a,b)=>a+b,0);
  const pct=e=>el[e]/total;
  return pct(dayEl)>=0.28?'旺':pct(dayEl)>=0.16?'中和':'弱';
}

/* 用神忌神推算（簡化版：旺→洩耗；弱→印比） */
function getYongShen(bz,el){
  const dayEl=S_EL[bz.day.si];
  const str=getDmStrength(bz,el);
  const EL_ORDER=['木','火','土','金','水'];
  const idx=EL_ORDER.indexOf(dayEl);
  /* 五行生剋位置 */
  const beget= EL_ORDER[(idx+1)%5];   // 日主生
  const begetBy=EL_ORDER[(idx+4)%5];  // 生日主
  const conquer=EL_ORDER[(idx+2)%5];  // 日主剋
  const conquered=EL_ORDER[(idx+3)%5];// 剋日主

  let yong=[],ji=[],xian=[];
  if(str==='旺'){
    // 旺：以洩（食傷）、耗（財）為用，忌比印
    yong=[beget,'（食傷洩秀）',conquer,'（財星耗身）'];
    ji=[dayEl,'（比劫助旺）',begetBy,'（印星生旺）'];
    xian=[conquered];
  } else if(str==='弱'){
    // 弱：以印（生身）、比（扶身）為用，忌食財官
    yong=[begetBy,'（印星生身）',dayEl,'（比劫扶身）'];
    ji=[conquer,'（官殺剋身）',conquered,'（財星洩印）'];
    xian=[beget];
  } else {
    // 中和：依命盤最弱五行補益
    const sorted=Object.entries(el).sort((a,b)=>a[1]-b[1]);
    yong=[sorted[0][0],'（補弱均衡）'];
    ji=[Object.entries(el).sort((a,b)=>b[1]-a[1])[0][0],'（避過旺）'];
    xian=[sorted[1][0]];
  }

  const descMap={
    旺:`日主「${dayEl}」偏強（${str}），宜以食傷、財星洩耗旺氣，使命局平衡流通。忌印星、比劫再加強日主。`,
    弱:`日主「${dayEl}」偏弱（${str}），宜以印星生扶、比劫幫身，增強主氣。忌官殺耗剋、財星洩印。`,
    中和:`日主「${dayEl}」中和，命局相對平衡，宜補強最弱之五行，避免過旺一方繼續增強。`
  };

  return {desc:descMap[str], yong, ji, xian, str, dayEl};
}

/* 六親宮位說明 */
function getPalaceData(bz,gender){
  const isMale=gender==='male';
  const palaces=[
    { pillar:'年柱', gz:`${bz.year.s}${bz.year.b}`, title:'祖上 · 父母',
      icon:'🏠',
      reading:`年柱代表祖業基礎與早年環境。天干「${bz.year.s}」顯示祖蔭能量，地支「${bz.year.b}」反映家庭氛圍與原生環境。`},
    { pillar:'月柱', gz:`${bz.month.s}${bz.month.b}`, title:'兄弟 · 事業',
      icon:'💼',
      reading:`月柱為人生黃金時期，代表事業格局與同輩關係。天干「${bz.month.s}」揭示職場特質，地支「${bz.month.b}」顯示工作環境與同儕緣分。`},
    { pillar:'日柱', gz:`${bz.day.s}${bz.day.b}`,
      title: isMale ? '自身 · 妻星' : '自身 · 夫星',
      icon: isMale ? '💑' : '💍',
      reading: isMale
        ? `日柱天干為日主（自身），地支「${bz.day.b}」為配偶宮，主論妻緣。男命以財星論妻，地支五行透露妻子個性與婚姻和諧度。`
        : `日柱天干為日主（自身），地支「${bz.day.b}」為配偶宮，主論夫緣。女命以官殺星論夫，地支五行透露夫婿特質與姻緣時機。`},
    { pillar:'時柱', gz:`${bz.hour.s}${bz.hour.b}`,
      title: isMale ? '子女 · 晚年' : '子女 · 晚年',
      icon:'🌙',
      reading: isMale
        ? `時柱代表晚年運勢與子女緣分。男命以官殺論子，地支「${bz.hour.b}」反映子息緣分薄厚，天干「${bz.hour.s}」象徵晚年成就。`
        : `時柱代表晚年運勢與子女緣分。女命以食傷論子，地支「${bz.hour.b}」反映子息緣分薄厚，天干「${bz.hour.s}」象徵晚年生活品質。`},
  ];
  return palaces;
}

/* 人生各面向 */
function getAspects(bz,el,ys,gender){
  const isMale=gender==='male';
  const dayEl=S_EL[bz.day.si];
  const EL_ORDER=['木','火','土','金','水'];
  const idx=EL_ORDER.indexOf(dayEl);
  const wealthEl=EL_ORDER[(idx+2)%5]; // 財星
  const officialEl=EL_ORDER[(idx+3)%5];// 官殺
  const foodEl=EL_ORDER[(idx+1)%5];   // 食傷

  const total=Object.values(el).reduce((a,b)=>a+b,0);
  const pct=e=>Math.round(el[e]/total*100);

  /* 感情/婚姻：男命看財星，女命看官殺 */
  const loveEl=isMale?wealthEl:officialEl;
  const loveLabel=isMale?'妻星（財）':'夫星（官殺）';
  const loveLv=pct(loveEl)>=25
    ? (isMale?`財星（${loveEl}）旺盛（${pct(loveEl)}%），桃花旺，感情機會多，惟需慎選，避免因財傷情。`
             :`官殺星（${loveEl}）旺盛（${pct(loveEl)}%），異性緣佳，感情線活躍，宜理性把握真緣。`)
    : pct(loveEl)<=8
    ? (isMale?`財星（${loveEl}）偏弱（${pct(loveEl)}%），感情宜主動表達，遇緣需珍惜，晚婚較佳。`
             :`官殺星（${loveEl}）偏弱（${pct(loveEl)}%），夫緣較薄，感情需主動耕耘，宜遇良緣後珍惜把握。`)
    : (isMale?`財星（${loveEl}）適中（${pct(loveEl)}%），感情發展穩健，適時表達心意可遇到良緣。`
             :`官殺星（${loveEl}）適中（${pct(loveEl)}%），夫緣穩定，感情發展循序漸進，有助於婚姻和諧。`);

  /* 事業 */
  const mEl=S_EL[bz.month.si];
  const careerHint=(EL_DETAIL[mEl]&&EL_DETAIL[mEl].career)||'多元領域';
  const careerLv=ys.str==='旺'?`日主強旺，宜從事需要主導力的行業，如管理、創業等。適合領域：${careerHint}。`:
                 ys.str==='弱'?`日主偏弱，宜借助團隊或平台發展，擅長輔佐型角色。適合領域：${careerHint}。`:
                 `日主中和，職業選擇彈性大。依月柱分析，適合領域：${careerHint}。`;

  /* 財運：男命看財星，女命看食傷（生財） */
  const wealthTarget=isMale?wealthEl:foodEl;
  const wealthLabelStr=isMale?`財星（${wealthEl}）`:`食傷（${foodEl}）`;
  const wealthLv=pct(wealthTarget)>=25
    ?`${wealthLabelStr}旺盛（${pct(wealthTarget)}%），求財積極，財路寬廣，惟注意理財避免過度揮霍。`
    :pct(wealthTarget)<=8
    ?`${wealthLabelStr}偏弱（${pct(wealthTarget)}%），財運需主動耕耘，宜穩健理財，避免投機冒進。`
    :`${wealthLabelStr}適中（${pct(wealthTarget)}%），財運平穩，收支均衡，宜長期規劃積累財富。`;

  /* 子女：男命看官殺，女命看食傷 */
  const childEl=isMale?officialEl:foodEl;
  const childLabel=isMale?`官殺星（${officialEl}）`:`食傷星（${foodEl}）`;

  /* 健康：最弱五行 */
  const weakEl=Object.entries(el).sort((a,b)=>a[1]-b[1])[0][0];
  const organ=(EL_DETAIL[weakEl]&&EL_DETAIL[weakEl].organ)||'相關臟腑';
  const healthLv=`命盤中「${weakEl}」最弱（${pct(weakEl)}%），對應臟腑「${organ}」需多加留意。建議定期健檢，養成良好作息。`;

  return [
    {icon: isMale?'💑':'💍', title: isMale?'妻星 · 感情運':'夫星 · 感情運',
     color:'rc-fire', body:loveLv, sub:`${loveLabel}佔比 ${pct(loveEl)}%`},
    {icon:'💼',title:'事業格局',color:'rc-metal', body:careerLv,
     sub:`月柱天干五行：${mEl}`},
    {icon:'💰',title:'財富運勢',color:'rc-earth', body:wealthLv,
     sub:`${wealthLabelStr}：${pct(wealthTarget)}%`},
    {icon:'🌿',title:'健康提示',color:'rc-wood', body:healthLv,
     sub:`最弱五行：${weakEl} → 注意 ${organ}`},
  ];
}

/* 補運建議 */
function getSuggest(bz,el,ys){
  const yongEls=[];
  // 取用神（偶數索引為五行名）
  for(let i=0;i<ys.yong.length;i+=2) yongEls.push(ys.yong[i]);

  // 主用神
  const mainYong=yongEls[0]||ys.dayEl;
  const d=EL_DETAIL[mainYong]||EL_DETAIL['土'];

  const intro=`日主${ys.str}，用神為「${yongEls.join('、')}」。以下建議從日常生活補充用神能量，助旺命局流通。`;

  const items=[
    {icon:'🎨',label:'幸運色系',val:d.color},
    {icon:'🧭',label:'幸運方位',val:d.dir},
    {icon:'🔢',label:'吉祥數字',val:d.num},
    {icon:'🌱',label:'適合季節',val:d.season},
    {icon:'💼',label:'建議行業',val:d.career},
    {icon:'🏥',label:'養生重點',val:d.organ},
  ];
  return {intro,items};
}

/* ══════════════════════════════════════════════════
   渲染擴充分析區塊
══════════════════════════════════════════════════ */
function renderExtendedAnalysis(bz,el,gender){
  /* 用神忌神 */
  const ys=getYongShen(bz,el);
  document.getElementById('yongDesc').textContent=ys.desc;
  const tagMap={yong:{cls:'good',label:'用神'},ji:{cls:'bad',label:'忌神'},xian:{cls:'neutral',label:'閒神'}};
  let yr='';
  ['yong','ji','xian'].forEach(type=>{
    const arr=ys[type];
    for(let i=0;i<arr.length;i+=2){
      yr+=`<span class="yong-tag ${tagMap[type].cls}">${tagMap[type].label} · ${arr[i]} ${arr[i+1]||''}</span>`;
    }
    if(type==='xian'&&arr.length===1){
      yr+=`<span class="yong-tag ${tagMap[type].cls}">${tagMap[type].label} · ${arr[0]}</span>`;
    }
  });
  document.getElementById('yongRow').innerHTML=yr;

  /* 六親宮位 */
  const pd=getPalaceData(bz,gender);
  let pt=`<thead><tr><th>宮位</th><th>干支</th><th>主論</th><th>解析</th></tr></thead><tbody>`;
  pd.forEach(p=>{
    pt+=`<tr>
      <td style="white-space:nowrap">${p.icon} ${p.pillar}</td>
      <td><span class="palace-pillar-badge">${p.gz}</span></td>
      <td style="white-space:nowrap;color:var(--gold);font-size:0.73rem">${p.title}</td>
      <td>${p.reading}</td>
    </tr>`;
  });
  pt+=`</tbody>`;
  document.getElementById('palaceTable').innerHTML=pt;

  /* 人生各面向 */
  const asp=getAspects(bz,el,ys,gender);
  let ag='';
  asp.forEach(a=>{
    ag+=`<div class="reading-card ${a.color}">
      <div class="rc-icon">${a.icon}</div>
      <div class="rc-title">${a.title}</div>
      <div class="rc-body">${a.body}</div>
      <div class="rc-sub">${a.sub}</div>
    </div>`;
  });
  document.getElementById('aspectGrid').innerHTML=ag;

  /* 補運建議 */
  const sg=getSuggest(bz,el,ys);
  document.getElementById('suggestIntro').textContent=sg.intro;
  let si='';
  sg.items.forEach(s=>{
    si+=`<div class="suggest-item">
      <div class="suggest-icon">${s.icon}</div>
      <div class="suggest-label">${s.label}</div>
      <div class="suggest-val">${s.val}</div>
    </div>`;
  });
  document.getElementById('suggestGrid').innerHTML=si;
}


