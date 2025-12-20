/**
 * IP Display Widget - Optimized Version
 * 液态玻璃 IP 信息显示条 - 精简优化版
 * 
 * 特性：10秒自动收起 | 悬停暂停 | 液态玻璃样式 | 悬浮动画
 */

(function () {
    'use strict';

    // 创建容器
    const bar = document.createElement('div');
    bar.id = 'ip-glass-bar';
    bar.innerHTML = `
        <div class="ip-content">
            <span class="ip-dot">◉</span>
            <span class="ip-label">Your IP:</span>
            <span id="ip-address">Loading...</span>
            <span class="divider">|</span>
            <span id="ip-location">--</span>
            <span class="divider">|</span>
            <span id="ip-asn">--</span>
        </div>
        <div class="ip-icon-collapsed">📍</div>
    `;

    // CSS 样式
    const style = document.createElement('style');
    style.textContent = `
        #ip-glass-bar {
            --glass-bg-light: linear-gradient(135deg, rgba(255,255,255,.25), rgba(255,255,255,.1) 50%, rgba(255,255,255,.15));
            --glass-bg-dark: linear-gradient(135deg, rgba(255,255,255,.1), rgba(255,255,255,.05) 50%, rgba(255,255,255,.08));
            --shadow-base: 0 8px 32px rgba(0,0,0,.1), inset 0 1px 1px rgba(255,255,255,.6), inset 0 -1px 1px rgba(0,0,0,.05);
            --shadow-hover: 0 12px 48px rgba(0,0,0,.15), inset 0 1px 1px rgba(255,255,255,.8), inset 0 -1px 1px rgba(0,0,0,.05), 0 0 20px rgba(255,255,255,.3);
            
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: var(--glass-bg-light);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255,255,255,.4);
            border-radius: 50px;
            box-shadow: var(--shadow-base);
            padding: 10px 24px;
            cursor: pointer;
            opacity: 0;
            transition: all 500ms cubic-bezier(.4,0,.2,1);
            font: 600 13px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: rgba(0,0,0,.7);
            white-space: nowrap;
        }

        #ip-glass-bar:hover {
            transform: translateX(-50%) translateY(-3px) scale(1.02);
            box-shadow: var(--shadow-hover);
            background: linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,.15) 50%, rgba(255,255,255,.25));
        }

        #ip-glass-bar .ip-content { display: flex; align-items: center; gap: 10px; }
        #ip-glass-bar .ip-icon-collapsed { display: none; font-size: 20px; line-height: 1; }
        #ip-glass-bar .ip-dot { color: #e05555; font-size: 12px; animation: ip-pulse 2s ease-in-out infinite; }
        #ip-glass-bar .ip-label { color: #e05555; }
        #ip-glass-bar .divider { color: rgba(0,0,0,.2); margin: 0 4px; }

        @keyframes ip-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }

        #ip-glass-bar.collapsed {
            left: auto;
            right: 20px;
            transform: none;
            padding: 12px;
            border-radius: 50%;
        }
        #ip-glass-bar.collapsed .ip-content { display: none; }
        #ip-glass-bar.collapsed .ip-icon-collapsed { display: flex; align-items: center; justify-content: center; }
        #ip-glass-bar.collapsed:hover { transform: translateY(-3px) scale(1.05); }

        /* 深色模式 */
        html.dark #ip-glass-bar {
            background: var(--glass-bg-dark);
            border-color: rgba(255,255,255,.15);
            color: rgba(255,255,255,.85);
            box-shadow: 0 8px 32px rgba(0,0,0,.3), inset 0 1px 1px rgba(255,255,255,.2), inset 0 -1px 1px rgba(0,0,0,.1);
        }
        html.dark #ip-glass-bar:hover {
            box-shadow: 0 12px 48px rgba(0,0,0,.4), inset 0 1px 1px rgba(255,255,255,.3), inset 0 -1px 1px rgba(0,0,0,.1), 0 0 20px rgba(255,255,255,.1);
            background: linear-gradient(135deg, rgba(255,255,255,.15), rgba(255,255,255,.08) 50%, rgba(255,255,255,.12));
        }
        html.dark #ip-glass-bar .ip-dot,
        html.dark #ip-glass-bar .ip-label { color: #ff7b7b; }
        html.dark #ip-glass-bar .divider { color: rgba(255,255,255,.2); }

        @media (max-width: 600px) {
            #ip-glass-bar { font-size: 12px; padding: 8px 18px; max-width: 90%; }
            #ip-glass-bar .ip-label { display: none; }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(bar);

    // 状态管理
    let isExpanded = true;
    let timer = null;

    // 更新 IP 信息
    const updateIP = (data) => {
        document.getElementById('ip-address').textContent = data.ip || '--';
        document.getElementById('ip-location').textContent =
            `${data.country_name || data.country || '--'} · ${data.city || '--'}`;
        const asn = data.asn ? (data.asn.startsWith('AS') ? data.asn : 'AS' + data.asn) : '';
        document.getElementById('ip-asn').textContent = (asn + (data.org ? ' ' + data.org : '')) || '--';
    };

    // 获取 IP 信息
    async function fetchIPInfo() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            updateIP(data);
        } catch (err) {
            console.error('[IP Bar] API 请求失败:', err);
            document.getElementById('ip-address').textContent = 'Failed';
            document.getElementById('ip-location').textContent = 'Please refresh';
            document.getElementById('ip-asn').textContent = '--';
        }
    }

    // 展开/收起
    const expand = () => {
        isExpanded = true;
        bar.classList.remove('collapsed');
        clearTimeout(timer);
        timer = setTimeout(collapse, 10000);
    };

    const collapse = () => {
        isExpanded = false;
        bar.classList.add('collapsed');
        clearTimeout(timer);
    };

    // 事件监听
    bar.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded ? collapse() : expand();
    });

    bar.addEventListener('mouseenter', () => isExpanded && clearTimeout(timer));
    bar.addEventListener('mouseleave', () => {
        if (isExpanded) {
            clearTimeout(timer);
            timer = setTimeout(collapse, 3000);
        }
    });

    // 初始化
    fetchIPInfo();
    setTimeout(() => {
        bar.style.opacity = '1';
        expand();
    }, 300);

    console.log('[IP Bar] 加载完成');
})();
