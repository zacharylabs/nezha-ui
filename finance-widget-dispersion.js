/*!
 * ============================================================
 * 💰 NezhaUI - Finance Widget (资产统计模块)
 * ============================================================
 * 版本: v2.1.0
 * 作者: Zachary
 * GitHub: https://github.com/zacharylabs/nezha-ui
 * 描述: 为哪吒探针 V1 提供服务器资产统计功能
 * 特点: 自包含模块（HTML + CSS + JS 自动注入）
 * ============================================================
 */
(function () {
    'use strict';

    // === CSS 样式（自动注入） ===
    const FINANCE_CSS = `
/* 加载动画 */
@keyframes fin-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* 资产悬浮球 (色散版) */
.finance-ball {
    position: fixed;
    right: 20px;
    top: 140px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    /* 液态玻璃效果 (色散版) */
    background: transparent linear-gradient(135deg, rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, .01) 50%, rgba(255, 255, 255, .1) 100%) !important;
    backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    -webkit-backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    border: 1px solid rgba(255, 255, 255, .4) !important;
    border-top: 1px solid rgba(255, 255, 255, .6) !important;
    /* 色散光晕 */
    box-shadow: 
        inset 3px 0 6px rgba(0, 255, 255, 0.4),
        inset -3px 0 6px rgba(255, 0, 255, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, .8),
        0 12px 40px rgba(0, 0, 0, .08) !important;
    z-index: 1041;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all .3s ease !important;
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
    color: #0ea5e9;
}

.finance-ball.show {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
}

.finance-ball:hover {
    transform: scale(1.015) translateY(-3px) !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, .3) 0%, rgba(255, 255, 255, .05) 50%, rgba(255, 255, 255, .2) 100%) !important;
    backdrop-filter: blur(10px) saturate(220%) contrast(1.2) !important;
    -webkit-backdrop-filter: blur(10px) saturate(220%) contrast(1.2) !important;
    border-color: rgba(255, 255, 255, .8) !important;
    /* 悬停时色散增强 */
    box-shadow: 
        inset 4px 0 8px rgba(0, 255, 255, 0.5),
        inset -4px 0 8px rgba(255, 0, 255, 0.4),
        inset 0 2px 6px rgba(255, 255, 255, .9),
        0 20px 50px -10px rgba(0, 0, 0, .15) !important;
}

/* 暗色模式悬浮球 (色散版) */
html.dark .finance-ball {
    background: transparent linear-gradient(135deg, rgba(0, 0, 0, .2) 0%, rgba(0, 0, 0, .01) 50%, rgba(0, 0, 0, .1) 100%) !important;
    backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    -webkit-backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    border: 1px solid rgba(255, 255, 255, .15) !important;
    border-top: 1px solid rgba(255, 255, 255, .25) !important;
    /* 色散光晕 */
    box-shadow: 
        inset 3px 0 6px rgba(0, 255, 255, 0.4),
        inset -3px 0 6px rgba(255, 0, 255, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, .15),
        0 12px 40px rgba(0, 0, 0, .3) !important;
}

html.dark .finance-ball:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, .1) 0%, rgba(255, 255, 255, .02) 50%, rgba(255, 255, 255, .08) 100%) !important;
    backdrop-filter: blur(10px) saturate(220%) contrast(1.2) !important;
    -webkit-backdrop-filter: blur(10px) saturate(220%) contrast(1.2) !important;
    border-color: rgba(255, 255, 255, .3) !important;
    /* 悬停时色散增强 */
    box-shadow: 
        inset 4px 0 8px rgba(0, 255, 255, 0.5),
        inset -4px 0 8px rgba(255, 0, 255, 0.4),
        inset 0 2px 6px rgba(255, 255, 255, .2),
        0 20px 50px -10px rgba(0, 0, 0, .5) !important;
}

/* 移动端响应式 */
@media (max-width: 768px) {
    .finance-ball {
        width: 40px;
        height: 40px;
        right: 15px;
    }
    .finance-ball svg {
        width: 22px;
        height: 22px;
    }
}

/* 资产统计面板 (色散版) */
.finance-widget {
    position: fixed;
    right: 20px;
    top: 130px;
    z-index: 1040;
    width: 320px;
    border-radius: 16px;
    /* 液态玻璃效果 (色散版) */
    background: transparent linear-gradient(135deg, rgba(255, 255, 255, .2) 0%, rgba(255, 255, 255, .01) 50%, rgba(255, 255, 255, .1) 100%) !important;
    backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    -webkit-backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    border: 1px solid rgba(255, 255, 255, .4) !important;
    border-top: 1px solid rgba(255, 255, 255, .6) !important;
    /* 色散光晕 */
    box-shadow: 
        inset 3px 0 6px rgba(0, 255, 255, 0.4),
        inset -3px 0 6px rgba(255, 0, 255, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, .8),
        0 12px 40px rgba(0, 0, 0, .08) !important;
    transition: all .3s ease-out !important;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
    color: rgba(0, 0, 0, .9);
    text-shadow: 0 0.5px 1px rgba(255, 255, 255, .3);
}

.finance-widget.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

/* 暗色模式面板 (色散版) */
html.dark .finance-widget {
    background: transparent linear-gradient(135deg, rgba(0, 0, 0, .2) 0%, rgba(0, 0, 0, .01) 50%, rgba(0, 0, 0, .1) 100%) !important;
    backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    -webkit-backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    border: 1px solid rgba(255, 255, 255, .15) !important;
    border-top: 1px solid rgba(255, 255, 255, .25) !important;
    /* 色散光晕 */
    box-shadow: 
        inset 3px 0 6px rgba(0, 255, 255, 0.4),
        inset -3px 0 6px rgba(255, 0, 255, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, .15),
        0 12px 40px rgba(0, 0, 0, .3) !important;
    color: rgba(255, 255, 255, .95);
    text-shadow: 0 0.5px 1px rgba(0, 0, 0, .2);
}

/* 面板头部 */
.finance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, .2);
}
html.dark .finance-header { border-bottom: 1px solid rgba(255, 255, 255, .1); }

.finance-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 1.05rem;
    color: #0052cc;
    margin: 0;
}
html.dark .finance-title { color: #66b3ff; }

/* 面板内容 */
.finance-content {
    padding: 16px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

/* 统计行 */
.finance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 0.9rem;
}

.finance-value {
    font-weight: bold;
    color: #0052cc !important;
    text-shadow: 0 1px 2px rgba(255, 255, 255, .5);
}
html.dark .finance-value {
    color: #66b3ff !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
}

/* 分隔线 */
.finance-separator {
    height: 1px;
    background: rgba(255, 255, 255, .2);
    margin: 12px 0;
}
html.dark .finance-separator { background: rgba(255, 255, 255, .1); }

/* 详细列表 */
.finance-list {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 5px;
    margin-bottom: 8px;
}

.finance-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 0.85rem;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    border: none;
    transition: all .2s ease;
}
.finance-list-item:hover { background: rgba(255, 255, 255, .1); }
html.dark .finance-list-item:hover { background: rgba(255, 255, 255, .05); }

.item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
}

/* 控制区 */
.finance-controls {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, .2);
    justify-content: space-between;
    align-items: center;
}
html.dark .finance-controls { border-top: 1px solid rgba(255, 255, 255, .1); }

.finance-select {
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, .25) !important;
    color: inherit !important;
    border-radius: 8px !important;
    font-size: 0.8rem !important;
    padding: 5px 24px 5px 8px !important;
    outline: none !important;
    cursor: pointer !important;
    transition: all .2s ease !important;
    appearance: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 6px center !important;
}
.finance-select:hover {
    background: rgba(255, 255, 255, .08) !important;
    border-color: rgba(255, 255, 255, .35) !important;
}
html.dark .finance-select {
    border: 1px solid rgba(255, 255, 255, .15) !important;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
}
html.dark .finance-select:hover {
    background: rgba(255, 255, 255, .05) !important;
    border-color: rgba(255, 255, 255, .2) !important;
}

.finance-btn {
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    color: inherit !important;
    opacity: 0.6 !important;
    transition: all .2s ease !important;
    padding: 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}
.finance-btn:hover { opacity: 1 !important; transform: scale(1.1) !important; }
.finance-btn.active { color: #0ea5e9 !important; opacity: 1 !important; }

/* 提示文本 */
.finance-tooltip {
    font-size: 0.75rem;
    opacity: 0.6;
    margin-top: 4px;
    text-align: right;
}

/* 配置模态框 */
.finance-config-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    z-index: 2000;
    display: none;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.finance-config-overlay.show { display: flex; opacity: 1; }

.finance-config-modal {
    background: transparent linear-gradient(125deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .8) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, .5);
    border-radius: 16px;
    padding: 0;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 12px 40px rgba(0, 0, 0, .2);
}
html.dark .finance-config-modal {
    background: transparent linear-gradient(135deg, rgba(0, 0, 0, .8) 0%, rgba(0, 0, 0, .7) 100%);
    border: 1px solid rgba(255, 255, 255, .15);
}

.finance-config-content { padding: 20px; }
.finance-config-content input {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, .3);
    background: rgba(255, 255, 255, .3);
    font-size: 0.9rem;
}
html.dark .finance-config-content input {
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .15);
    color: #fff;
}
.finance-config-content button {
    width: 100%;
    padding: 10px;
    margin-top: 12px;
    border-radius: 8px;
    border: none;
    background: var(--accent-11, #0ea5e9);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.finance-config-content button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}
#config-status { margin-top: 12px; font-size: 0.85rem; text-align: center; }

/* 响应式 */
@media (max-width: 768px) {
    .finance-widget { width: calc(100vw - 40px); right: 20px; }
}
`;

    // === HTML 模板 ===
    const FINANCE_HTML = `
<!-- 资产统计悬浮球 -->
<div id="finance-ball" class="finance-ball">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
    </svg>
</div>

<!-- 资产统计面板 -->
<div id="finance-widget" class="finance-widget">
    <div class="finance-header">
        <h3 class="finance-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
            </svg>
            资产统计
        </h3>
        <button class="finance-btn" id="financeClose" title="关闭">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
            </svg>
        </button>
    </div>
    <div class="finance-content">
        <div class="finance-row"><span>服务器数量</span><span class="finance-value" id="fin-total-count">...</span></div>
        <div class="finance-row"><span>总价值</span><span class="finance-value" id="fin-total-price">...</span></div>
        <div class="finance-row"><span>月均支出</span><span class="finance-value" id="fin-monthly-price">...</span></div>
        <div class="finance-row"><span>剩余总价值</span><span class="finance-value" id="fin-remain-value">...</span></div>
        <div class="finance-separator"></div>
        <div id="fin-detail-list" class="finance-list"></div>
        <div class="finance-tooltip" id="fin-ex-rate">汇率更新中...</div>
        <div class="finance-controls">
            <div style="display: flex; gap: 8px;">
                <select id="fin-currency" class="finance-select">
                    <option value="CNY">CNY (￥)</option>
                    <option value="USD">USD ($)</option>
                    <option value="HKD">HKD (HK$)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                </select>
                <select id="fin-sort" class="finance-select">
                    <option value="weight_asc">权重 正序</option>
                    <option value="weight_desc">权重 倒序</option>
                    <option value="price_asc">价格 正序</option>
                    <option value="price_desc">价格 倒序</option>
                </select>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="finance-btn" id="fin-toggle-free" title="排除/包含白嫖">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 5c-1.5 0-2.8 0.6-3.8 1.6l-1.2 1.2-1.2-1.2C11.8 5.6 10.5 5 9 5 5.5 5 3 7.6 3 11c0 3.5 3 7.6 9 13 6-5.4 9-9.5 9-13 0-3.4-2.5-6-6-6z" />
                    </svg>
                </button>
                <button class="finance-btn" id="fin-config" title="配置">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m8.66-13.68l-3.46 3.46m-6.92 6.92L4.34 22m17.32-4.34l-3.46-3.46m-6.92-6.92L4.34 2" />
                    </svg>
                </button>
                <button class="finance-btn" id="fin-refresh" title="刷新数据">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- 配置模态框 -->
<div id="finance-config-overlay" class="finance-config-overlay">
    <div class="finance-config-modal">
        <div class="finance-header">
            <h3 class="finance-title">资产统计配置</h3>
            <button class="finance-btn" id="config-close" title="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                </svg>
            </button>
        </div>
        <div class="finance-config-content">
            <input type="text" id="nezha-username" placeholder="用户名" />
            <input type="password" id="nezha-password" placeholder="密码" />
            <button id="nezha-login-btn">登录</button>
            <div id="config-status"></div>
        </div>
    </div>
</div>
`;

    // === 注入 CSS 和 HTML ===
    function injectAssets() {
        // 注入 CSS
        const style = document.createElement('style');
        style.id = 'finance-widget-styles';
        style.textContent = FINANCE_CSS;
        document.head.appendChild(style);

        // 注入 HTML
        const container = document.createElement('div');
        container.id = 'finance-widget-container';
        container.innerHTML = FINANCE_HTML;
        document.body.appendChild(container);
    }

    // === 配置 ===
    const CONFIG = {
        STORAGE_KEY_TOKEN: 'nezha_finance_token',
        STORAGE_KEY_TOKEN_EXPIRE: 'nezha_finance_token_expire',
        STORAGE_KEY_CURRENCY: 'fin_currency',
        STORAGE_KEY_SORT: 'fin_sort',
        STORAGE_KEY_EXCLUDE_FREE: 'fin_exclude_free',
        TOKEN_EXPIRE_MS: 30 * 1000,
        OBFUSCATE_KEY: 'NEZHA_FINANCE_2024',
        LONG_TERM_THRESHOLD_YEARS: 100,
        CACHE_DURATION_MS: 30 * 1000,
        BALL_SHOW_DELAY_MS: 600,
        REFRESH_ANIMATION_MS: 1000,
        LOGIN_SUCCESS_DELAY_MS: 1000
    };

    // === 状态变量 ===
    let elements = {};
    let exchangeRates = { CNY: 1, USD: 0.14, HKD: 1.08, EUR: 0.13, GBP: 0.11, JPY: 20.8 };
    let userCurrency = localStorage.getItem(CONFIG.STORAGE_KEY_CURRENCY) || 'CNY';
    let sortBy = localStorage.getItem(CONFIG.STORAGE_KEY_SORT) || 'weight_asc';
    let excludeFree = localStorage.getItem(CONFIG.STORAGE_KEY_EXCLUDE_FREE) === 'true';
    const currencySymbols = { 'CNY': '￥', 'USD': '$', 'HKD': 'HK$', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
    let cachedServers = null;
    let cacheTimestamp = 0;
    let isLoading = false;

    // === 初始化 ===
    function init() {
        injectAssets();

        elements = {
            ball: document.getElementById('finance-ball'),
            widget: document.getElementById('finance-widget'),
            closeBtn: document.getElementById('financeClose'),
            configBtn: document.getElementById('fin-config'),
            refreshBtn: document.getElementById('fin-refresh'),
            toggleFreeBtn: document.getElementById('fin-toggle-free'),
            currencySelect: document.getElementById('fin-currency'),
            sortSelect: document.getElementById('fin-sort'),
            detailList: document.getElementById('fin-detail-list'),
            totalCount: document.getElementById('fin-total-count'),
            totalPrice: document.getElementById('fin-total-price'),
            monthlyPrice: document.getElementById('fin-monthly-price'),
            remainValue: document.getElementById('fin-remain-value'),
            exRate: document.getElementById('fin-ex-rate'),
            configOverlay: document.getElementById('finance-config-overlay'),
            configClose: document.getElementById('config-close'),
            usernameInput: document.getElementById('nezha-username'),
            passwordInput: document.getElementById('nezha-password'),
            loginBtn: document.getElementById('nezha-login-btn'),
            configStatus: document.getElementById('config-status'),
        };

        if (!elements.ball || !elements.widget) {
            console.error('[Finance] 初始化失败：DOM 元素未找到');
            return;
        }

        elements.currencySelect.value = userCurrency;
        elements.sortSelect.value = sortBy;
        updateToggleFreeState();

        // 事件监听
        elements.ball.addEventListener('click', showWidget);
        elements.closeBtn.addEventListener('click', hideWidget);
        elements.refreshBtn.addEventListener('click', refreshData);
        elements.toggleFreeBtn.addEventListener('click', toggleFree);
        elements.configBtn.addEventListener('click', showConfig);
        elements.currencySelect.addEventListener('change', handleCurrencyChange);
        elements.sortSelect.addEventListener('change', handleSortChange);
        elements.configClose.addEventListener('click', hideConfig);
        elements.loginBtn.addEventListener('click', handleLogin);
        elements.configOverlay.addEventListener('click', (e) => {
            if (e.target === elements.configOverlay) hideConfig();
        });
        elements.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });

        fetchRates().then(() => {
            setTimeout(() => elements.ball.classList.add('show'), CONFIG.BALL_SHOW_DELAY_MS);
        });

        console.log('[Finance] ✓ 资产统计模块加载完成');
    }

    // === 工具函数 ===
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function obfuscate(str) {
        if (!str) return '';
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ CONFIG.OBFUSCATE_KEY.charCodeAt(i % CONFIG.OBFUSCATE_KEY.length));
        }
        return btoa(result);
    }

    function deobfuscate(str) {
        if (!str) return '';
        try {
            const decoded = atob(str);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ CONFIG.OBFUSCATE_KEY.charCodeAt(i % CONFIG.OBFUSCATE_KEY.length));
            }
            return result;
        } catch (e) {
            return '';
        }
    }

    function saveToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN, obfuscate(token));
        localStorage.setItem(CONFIG.STORAGE_KEY_TOKEN_EXPIRE, (Date.now() + CONFIG.TOKEN_EXPIRE_MS).toString());
    }

    function getToken() {
        const obfuscated = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN);
        const expireTime = localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN_EXPIRE);
        if (!obfuscated || !expireTime) return null;
        if (Date.now() > parseInt(expireTime)) {
            clearToken();
            return null;
        }
        return deobfuscate(obfuscated);
    }

    function clearToken() {
        localStorage.removeItem(CONFIG.STORAGE_KEY_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEY_TOKEN_EXPIRE);
    }

    // === API 函数 ===
    async function nezhaLogin(username, password) {
        const response = await fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            if (response.status === 401) throw new Error('用户名或密码错误');
            if (response.status === 429) throw new Error('请求过于频繁');
            throw new Error(`服务器错误 (${response.status})`);
        }
        const data = await response.json();
        return data.token || data.data?.token || data.result?.token;
    }

    async function fetchNezhaServers(token) {
        const response = await fetch('/api/v1/server', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401) { clearToken(); throw new Error('认证失败'); }
            throw new Error(`服务器错误 (${response.status})`);
        }
        const data = await response.json();
        return data.result || data.data || [];
    }

    async function fetchRates() {
        const apis = [
            { url: 'https://api.exchangerate-api.com/v4/latest/CNY', parser: d => d.rates },
            { url: 'https://open.er-api.com/v6/latest/CNY', parser: d => d.rates }
        ];
        for (let i = 0; i < apis.length; i++) {
            try {
                const res = await fetch(apis[i].url);
                if (res.ok) {
                    const rates = apis[i].parser(await res.json());
                    if (rates) {
                        exchangeRates = rates;
                        elements.exRate.textContent = `汇率更新: ${new Date().toLocaleTimeString()}`;
                        elements.exRate.style.color = '#10b981';
                        return true;
                    }
                }
            } catch (e) { /* 继续下一个 */ }
        }
        elements.exRate.textContent = '使用默认汇率';
        elements.exRate.style.color = '#f59e0b';
        return false;
    }

    // === 数据解析 ===
    function parseServerData(server) {
        try {
            const note = JSON.parse(server.public_note || '{}');
            const billing = note.billingDataMod;
            if (!billing?.amount) return null;
            const match = billing.amount.match(/^([^\d.]+)?([0-9.]+)$/);
            if (!match) return null;
            const cycleMap = { 'Year': 365, 'Month': 30, 'Week': 7, 'Day': 1 };
            return {
                name: server.name,
                price: parseFloat(match[2]) || 0,
                currency: match[1] || '￥',
                billing_cycle: cycleMap[billing.cycle] || 30,
                expired_at: billing.endDate,
                tags: server.tag ? [server.tag] : [],
                weight: server.display_index || 0
            };
        } catch (e) { return null; }
    }

    function convertToBaseCurrency(price, currency) {
        const currencyMap = {
            '￥': 'CNY', '¥': 'CNY', 'CNY': 'CNY', '$': 'USD', 'USD': 'USD',
            'HK$': 'HKD', 'HKD': 'HKD', '€': 'EUR', 'EUR': 'EUR', '£': 'GBP', 'GBP': 'GBP'
        };
        const code = currencyMap[currency] || 'CNY';
        if (code === 'CNY') return price;
        const rate = exchangeRates[code];
        return rate ? price / rate : price;
    }

    // === 计算逻辑 ===
    function calculate(parsedData) {
        parsedData.sort((a, b) => {
            if (sortBy === 'weight_asc') return a.weight - b.weight;
            if (sortBy === 'weight_desc') return b.weight - a.weight;
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return 0;
        });

        let totalPriceCNY = 0, monthlyPriceCNY = 0, totalRemainValCNY = 0, totalNodes = 0;
        const now = new Date();
        const targetRate = exchangeRates[userCurrency] || 1;
        const sym = currencySymbols[userCurrency] || userCurrency;

        elements.detailList.innerHTML = '';

        parsedData.forEach(node => {
            totalNodes++;
            const isFreeTag = node.tags.includes('白嫖中');
            const priceCNY = convertToBaseCurrency(node.price, node.currency);
            let cycleMonths = node.billing_cycle === 365 ? 12 : (node.billing_cycle > 0 ? node.billing_cycle / 30 : 1);
            const pricePerMonth = cycleMonths > 0 ? priceCNY / cycleMonths : 0;

            let remainingVal = 0;
            if (node.expired_at) {
                const exp = new Date(node.expired_at);
                const diffMs = exp - now;
                const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365);
                if (diffYears > CONFIG.LONG_TERM_THRESHOLD_YEARS) {
                    remainingVal = priceCNY;
                } else if (diffMs > 0) {
                    remainingVal = priceCNY * (diffMs / (node.billing_cycle * 24 * 60 * 60 * 1000));
                }
            }

            const shouldExclude = excludeFree && isFreeTag;
            const displayVal = remainingVal * targetRate;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'finance-list-item';
            itemDiv.innerHTML = `<span class="item-name" title="${escapeHtml(node.name)}">${escapeHtml(node.name)}</span><span class="finance-value">${sym} ${displayVal.toFixed(2)}</span>`;
            elements.detailList.appendChild(itemDiv);

            if (!shouldExclude) {
                totalPriceCNY += priceCNY;
                monthlyPriceCNY += pricePerMonth;
                totalRemainValCNY += remainingVal;
            }
        });

        elements.totalCount.textContent = totalNodes;
        elements.totalPrice.textContent = `${sym} ${(totalPriceCNY * targetRate).toFixed(2)}`;
        elements.monthlyPrice.textContent = `${sym} ${(monthlyPriceCNY * targetRate).toFixed(2)}`;
        elements.remainValue.textContent = `${sym} ${(totalRemainValCNY * targetRate).toFixed(2)}`;
    }

    // === UI 交互 ===
    function showWidget() { elements.ball.classList.remove('show'); elements.widget.classList.add('show'); loadData(); }
    function hideWidget() { elements.widget.classList.remove('show'); elements.ball.classList.add('show'); }
    function showLoadingState() {
        elements.totalCount.textContent = '...';
        elements.totalPrice.textContent = '加载中...';
        elements.monthlyPrice.textContent = '...';
        elements.remainValue.textContent = '...';
        elements.detailList.innerHTML = '<div style="text-align:center;padding:20px;color:#666;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:fin-spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg><div style="margin-top:8px;">正在加载数据...</div></div>';
    }
    function showErrorState(message) {
        elements.detailList.innerHTML = `<div style="text-align:center;padding:20px;color:#ef4444;"><div style="font-size:24px;">⚠️</div><div style="margin-top:8px;">${escapeHtml(message)}</div></div>`;
    }
    function showConfig() {
        elements.configOverlay.classList.add('show');
        const token = getToken();
        if (token) {
            const remaining = Math.max(0, parseInt(localStorage.getItem(CONFIG.STORAGE_KEY_TOKEN_EXPIRE)) - Date.now());
            elements.configStatus.textContent = `已登录，会话剩余 ${Math.ceil(remaining / 1000)} 秒`;
            elements.configStatus.style.color = '#10b981';
        } else {
            elements.configStatus.textContent = '请输入账号密码登录';
            elements.configStatus.style.color = '';
        }
    }
    function hideConfig() { elements.configOverlay.classList.remove('show'); }
    function updateToggleFreeState() {
        if (excludeFree) {
            elements.toggleFreeBtn.classList.add('active');
            elements.toggleFreeBtn.setAttribute('title', '当前：已排除白嫖中');
        } else {
            elements.toggleFreeBtn.classList.remove('active');
            elements.toggleFreeBtn.setAttribute('title', '当前：包含白嫖中');
        }
    }
    function toggleFree() { excludeFree = !excludeFree; localStorage.setItem(CONFIG.STORAGE_KEY_EXCLUDE_FREE, excludeFree); updateToggleFreeState(); loadData(); }
    function handleCurrencyChange(e) { userCurrency = e.target.value; localStorage.setItem(CONFIG.STORAGE_KEY_CURRENCY, userCurrency); loadData(); }
    function handleSortChange(e) { sortBy = e.target.value; localStorage.setItem(CONFIG.STORAGE_KEY_SORT, sortBy); loadData(); }
    function refreshData() {
        const svg = elements.refreshBtn.querySelector('svg');
        svg.style.animation = 'fin-spin 1s linear infinite';
        loadData(true).finally(() => { svg.style.animation = ''; });
    }
    async function handleLogin() {
        const username = elements.usernameInput.value.trim();
        const password = elements.passwordInput.value.trim();
        if (!username || !password) {
            elements.configStatus.textContent = '请输入用户名和密码';
            elements.configStatus.style.color = '#ef4444';
            return;
        }
        elements.loginBtn.disabled = true;
        elements.loginBtn.textContent = '登录中...';
        try {
            const token = await nezhaLogin(username, password);
            saveToken(token);
            elements.configStatus.textContent = '登录成功！';
            elements.configStatus.style.color = '#10b981';
            elements.passwordInput.value = '';
            setTimeout(() => { hideConfig(); loadData(true); }, CONFIG.LOGIN_SUCCESS_DELAY_MS);
        } catch (e) {
            elements.configStatus.textContent = e.message;
            elements.configStatus.style.color = '#ef4444';
        } finally {
            elements.loginBtn.disabled = false;
            elements.loginBtn.textContent = '登录';
        }
    }
    async function loadData(forceRefresh = false) {
        if (isLoading) return;
        const token = getToken();
        if (!token) { showConfig(); return; }
        const now = Date.now();
        if (!forceRefresh && cachedServers && (now - cacheTimestamp < CONFIG.CACHE_DURATION_MS)) {
            calculate(cachedServers.map(parseServerData).filter(d => d));
            return;
        }
        isLoading = true;
        showLoadingState();
        try {
            const servers = await fetchNezhaServers(token);
            cachedServers = servers;
            cacheTimestamp = now;
            calculate(servers.map(parseServerData).filter(d => d));
        } catch (e) {
            showErrorState('数据加载失败');
            showConfig();
        } finally {
            isLoading = false;
        }
    }

    // === 启动 ===
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
