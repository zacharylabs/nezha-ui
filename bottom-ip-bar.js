/**
 * IP Display Widget - Optimized Version
 * 液态玻璃 IP 信息显示条 - 优化版
 * 
 * 特性：
 * - 10秒后自动收起为图标 📍
 * - 点击图标展开
 * - 完全适配 NezhaUI 液态玻璃样式
 * - 双 API 备份
 * - 响应式设计
 */

(function () {
    'use strict';

    // ========== 创建 UI 元素 ==========

    const container = document.createElement('div');
    container.id = 'ip-glass-bar';
    container.innerHTML = `
        <div class="ip-content">
            <span class="ip-dot"></span>
            <span class="ip-label">Your IP:</span>
            <span id="ip-address">Loading...</span>
            <span class="divider">|</span>
            <span id="ip-location">--</span>
            <span class="divider">|</span>
            <span id="ip-asn">--</span>
        </div>
        <div class="ip-icon-collapsed">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
    `;

    // ========== CSS 样式 ==========

    const style = document.createElement('style');
    style.textContent = `
        #ip-glass-bar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background: transparent linear-gradient(135deg, 
                rgba(255,255,255,.4) 0%, 
                rgba(255,255,255,.1) 50%, 
                rgba(255,255,255,.2) 100%);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,.5);
            border-radius: 50px;
            box-shadow: 0 4px 10px rgba(0,0,0,.05), inset 0 1px 1px rgba(255,255,255,.8);
            padding: 10px 24px;
            cursor: pointer;
            opacity: 0;
            transition: all .3s ease-out;
            font-size: 13px;
            font-weight: 700;
            color: rgba(0,0,0,0.7);
            white-space: nowrap;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        #ip-glass-bar:hover {
            transform: translateX(-50%) translateY(-2px) scale(1.05);
            background: transparent linear-gradient(135deg,
                rgba(255,255,255,.6) 0%,
                rgba(255,255,255,.2) 50%,
                rgba(255,255,255,.4) 100%);
            border-color: rgba(255,255,255,.8);
            box-shadow: 0 8px 20px rgba(0,0,0,.1), inset 0 1px 2px rgba(255,255,255,.9);
        }
        
        #ip-glass-bar.collapsed:hover {
            transform: translateY(-2px) scale(1.05);
            background: transparent linear-gradient(135deg,
                rgba(255,255,255,.6) 0%,
                rgba(255,255,255,.2) 50%,
                rgba(255,255,255,.4) 100%);
            border-color: rgba(255,255,255,.8);
            box-shadow: 0 8px 20px rgba(0,0,0,.1), inset 0 1px 2px rgba(255,255,255,.9);
        }
        
        #ip-glass-bar .ip-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        #ip-glass-bar .ip-icon-collapsed {
            display: none;
        }
        
        #ip-glass-bar .ip-icon-collapsed svg {
            width: 32px;
            height: 32px;
            stroke: #0ea5e9;
        }
        
        #ip-glass-bar .ip-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
            animation: ip-pulse 2s infinite;
        }
        
        @keyframes ip-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        #ip-glass-bar .ip-label {
            opacity: 0.8;
            margin-right: 4px;
        }
        
        #ip-glass-bar .divider {
            color: rgba(0,0,0,0.3);
            opacity: 0.5;
            margin: 0 8px;
            font-weight: 300;
        }
        
        #ip-glass-bar.collapsed {
            left: auto;
            right: 20px;
            bottom: 20px;
            transform: none;
            width: 46px;
            height: 46px;
            padding: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        #ip-glass-bar.collapsed .ip-content {
            display: none;
        }
        
        #ip-glass-bar.collapsed .ip-icon-collapsed {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* 暗色模式 */
        html.dark #ip-glass-bar {
            background: transparent linear-gradient(135deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,.05) 100%);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,.15);
            color: #fff;
            text-shadow: 0 1px 3px rgba(0,0,0,.9);
        }
        
        html.dark #ip-glass-bar:hover {
            background: transparent linear-gradient(135deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,.05) 100%);
            border-color: rgba(255,255,255,.3);
        }
        
        html.dark #ip-glass-bar.collapsed:hover {
            transform: translateY(-2px) scale(1.05);
            background: transparent linear-gradient(135deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,.05) 100%);
            border-color: rgba(255,255,255,.3);
        }
        
        html.dark #ip-glass-bar .divider {
            color: rgba(255,255,255,0.4);
            opacity: 0.5;
        }
        
        html.dark #ip-glass-bar .ip-icon-collapsed svg {
            stroke: #38bdf8;
        }
        
        /* 平板适配 */
        @media (max-width: 900px) {
            #ip-glass-bar {
                font-size: 12px;
                padding: 8px 20px;
            }
            #ip-glass-bar .ip-content {
                gap: 8px;
            }
            #ip-glass-bar .divider {
                margin: 0 6px;
            }
        }
        
        /* 手机适配 */
        @media (max-width: 600px) {
            #ip-glass-bar {
                font-size: 10px;
                padding: 6px 12px;
                max-width: 92%;
                bottom: 15px;
                overflow-x: auto;
                overflow-y: hidden;
            }
            #ip-glass-bar .ip-content {
                gap: 4px;
                flex-wrap: nowrap;
            }
            #ip-glass-bar .ip-label {
                display: none;
            }
            #ip-glass-bar .divider {
                margin: 0 3px;
            }
            #ip-glass-bar .ip-dot {
                width: 6px;
                height: 6px;
                flex-shrink: 0;
            }
            #ip-glass-bar:hover {
                transform: translateX(-50%) translateY(-2px) scale(1.02);
            }
            #ip-glass-bar.collapsed {
                width: 40px;
                height: 40px;
                right: 15px;
                bottom: 15px;
            }
            #ip-glass-bar .ip-icon-collapsed svg {
                width: 22px;
                height: 22px;
            }
        }
        
        /* 超小屏幕 */
        @media (max-width: 400px) {
            #ip-glass-bar {
                font-size: 10px;
                padding: 5px 12px;
            }
            /* 保留所有信息 */
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    // ========== 状态管理 ==========

    let isExpanded = true;
    let autoCollapseTimer = null;

    // ========== 获取 IP 信息 ==========

    async function fetchIPInfo() {
        const apis = [
            {
                url: 'https://ipapi.co/json/',
                parse: function (data) {
                    return {
                        ip: data.ip,
                        location: (data.country_name || data.country || '--') + ' · ' + (data.city || '--'),
                        asn: (data.asn ? (data.asn.startsWith('AS') ? data.asn : 'AS' + data.asn) : '') + (data.org ? ' ' + data.org : '')
                    };
                }
            },
            {
                url: 'https://api.ip.sb/geoip',
                parse: function (data) {
                    return {
                        ip: data.ip,
                        location: (data.country || '--') + ' · ' + (data.city || '--'),
                        asn: data.isp ? (data.organization || data.isp) : '--'
                    };
                }
            },
            {
                url: 'https://ipinfo.io/json',
                parse: function (data) {
                    return {
                        ip: data.ip,
                        location: (data.country || '--') + ' · ' + (data.city || data.region || '--'),
                        asn: data.org || '--'
                    };
                }
            },
            {
                url: 'https://api.ipify.org?format=json',
                parse: function (data) {
                    return {
                        ip: data.ip,
                        location: '--',
                        asn: '--'
                    };
                }
            }
        ];

        for (let i = 0; i < apis.length; i++) {
            try {
                const res = await fetch(apis[i].url);
                const data = await res.json();
                const info = apis[i].parse(data);

                document.getElementById('ip-address').textContent = info.ip || '--';
                document.getElementById('ip-location').textContent = info.location || '--';
                document.getElementById('ip-asn').textContent = info.asn || '--';

                console.log('[IP Bar] 使用 API:', apis[i].url);
                return;
            } catch (e) {
                console.warn('[IP Bar] API 失败:', apis[i].url, e.message);
            }
        }

        // 所有 API 都失败
        document.getElementById('ip-address').textContent = '获取失败';
        document.getElementById('ip-location').textContent = '--';
        document.getElementById('ip-asn').textContent = '--';
        console.error('[IP Bar] 所有 API 请求失败');
    }

    // ========== 展开/收起控制 ==========

    function expand() {
        isExpanded = true;
        container.classList.remove('collapsed');
        // 清除内联样式，让 CSS 控制
        container.style.removeProperty('left');
        container.style.removeProperty('right');
        container.style.removeProperty('transform');

        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = setTimeout(collapse, 10000);
    }

    function collapse() {
        isExpanded = false;
        container.classList.add('collapsed');
        // 清除内联样式，让 CSS .collapsed 类控制
        container.style.removeProperty('left');
        container.style.removeProperty('right');
        container.style.removeProperty('transform');
        clearTimeout(autoCollapseTimer);
    }

    container.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isExpanded) {
            collapse();
        } else {
            expand();
        }
    });

    // ========== 初始化 ==========

    fetchIPInfo();

    setTimeout(function () {
        container.style.opacity = '1';
        expand();
    }, 300);

    console.log('[IP Bar] 加载完成');
})();