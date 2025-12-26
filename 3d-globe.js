/**
 * Nezha 3D Earth V14.0 - ULTIMATE EDITION (Self-Contained)
 * Features: 中文名称 + 访客连线 + 4K优化 + 全响应式 + 自动注入HTML
 * CDN: https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/3d-globe.js
 */
(function () {
    'use strict';

    // ========== HTML 自动注入 ==========
    function injectHTML() {
        // 检查是否已存在
        if (document.getElementById('earth-toggle-btn')) return;

        const html = `
<!-- 3D Globe 悬浮按钮 -->
<div id="earth-toggle-btn" title="Open Global Map">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke-width="1.5" />
        <path d="M12 2C12 2 15 6 15 12C15 18 12 22 12 22" stroke-width="1.5" stroke-linecap="round" />
        <path d="M12 2C12 2 9 6 9 12C9 18 12 22 12 22" stroke-width="1.5" stroke-linecap="round" />
        <path d="M2 12H22" stroke-width="1.5" stroke-linecap="round" />
        <path d="M4 8H20" stroke-width="1.5" stroke-linecap="round" />
        <path d="M4 16H20" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="12" cy="12" r="1.5" fill="#00ffff" />
    </svg>
</div>
<!-- 3D Globe 模态框 -->
<div class="earth-modal-overlay">
    <div id="earth-drawer-container">
        <div class="earth-header">
            <div class="earth-title">3D GLOBAL SERVER VISUALIZATION</div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <div id="theme-toggle-btn" title="Switch Day/Night Mode" style="cursor: pointer; pointer-events: auto; padding: 8px 16px; background: rgba(0, 255, 255, 0.15); border: 1px solid rgba(0, 255, 255, 0.4); border-radius: 6px; font-size: 12px; transition: all 0.3s;">
                    <span id="theme-icon">🌙</span> <span id="theme-text">NIGHT</span>
                </div>
                <div id="earth-close-btn"><span>DISCONNECT</span></div>
            </div>
        </div>
        <div class="earth-stats" id="earth-stats">
            <div>Total Servers: <span id="server-count">0</span></div>
            <div>Regions: <span id="country-count">0</span></div>
            <div>Status: <span id="globe-status">Ready</span></div>
            <div style="margin-top: 8px; font-size: 10px; opacity: 0.7; cursor: pointer;" id="toggle-debug">[Debug]</div>
        </div>
        <div id="debug-panel"></div>
        <div id="earth-render-area"></div>
    </div>
</div>`;

        // 插入到 body 末尾
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // 等待 DOM 加载完成后注入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectHTML();
        initGlobeModule();
    }

    function initGlobeModule() {
        const COORD_MAP = {
            'CN': [35.8617, 104.1954], 'HK': [22.3193, 114.1694], 'TW': [23.6978, 120.9605],
            'MO': [22.1987, 113.5439], 'JP': [36.2048, 138.2529], 'KR': [35.9078, 127.7669],
            'KP': [40.3399, 127.5101], 'SG': [1.3521, 103.8198], 'MY': [4.2105, 101.9758],
            'TH': [15.8700, 100.9925], 'VN': [14.0583, 108.2772], 'PH': [12.8797, 121.7740],
            'ID': [-0.7893, 113.9213], 'IN': [20.5937, 78.9629], 'PK': [30.3753, 69.3451],
            'BD': [23.6850, 90.3563], 'LK': [7.8731, 80.7718], 'MM': [21.9162, 95.9560],
            'KH': [12.5657, 104.9910], 'LA': [19.8563, 102.4955], 'NP': [28.3949, 84.1240],
            'BT': [27.5142, 90.4336], 'MN': [46.8625, 103.8467], 'KZ': [48.0196, 66.9237],
            'UZ': [41.3775, 64.5853], 'TM': [38.9697, 59.5563], 'KG': [41.2044, 74.7661],
            'TJ': [38.8610, 71.2761], 'AF': [33.9391, 67.7100], 'AE': [23.4241, 53.8478],
            'SA': [23.8859, 45.0792], 'IL': [31.0461, 34.8516], 'JO': [30.5852, 36.2384],
            'LB': [33.8547, 35.8623], 'SY': [34.8021, 38.9968], 'IQ': [33.2232, 43.6793],
            'IR': [32.4279, 53.6880], 'TR': [38.9637, 35.2433], 'YE': [15.5527, 48.5164],
            'OM': [21.4735, 55.9754], 'KW': [29.3117, 47.4818], 'QA': [25.3548, 51.1839],
            'BH': [26.0667, 50.5577], 'AM': [40.0691, 45.0382], 'AZ': [40.1431, 47.5769],
            'GE': [42.3154, 43.3569],
            'US': [37.0902, -95.7129], 'CA': [56.1304, -106.3468], 'MX': [23.6345, -102.5528],
            'GT': [15.7835, -90.2308], 'BZ': [17.1899, -88.4976], 'SV': [13.7942, -88.8965],
            'HN': [15.2000, -86.2419], 'NI': [12.8654, -85.2072], 'CR': [9.7489, -83.7534],
            'PA': [8.5380, -80.7821], 'CU': [21.5218, -77.7812], 'JM': [18.1096, -77.2975],
            'HT': [18.9712, -72.2852], 'DO': [18.7357, -70.1627],
            'GB': [55.3781, -3.4360], 'IE': [53.4129, -8.2439], 'FR': [46.2276, 2.2137],
            'DE': [51.1657, 10.4515], 'IT': [41.8719, 12.5674], 'ES': [40.4637, -3.7492],
            'PT': [39.3999, -8.2245], 'NL': [52.1326, 5.2913], 'BE': [50.5039, 4.4699],
            'LU': [49.8153, 6.1296], 'CH': [46.8182, 8.2275], 'AT': [47.5162, 14.5501],
            'SE': [60.1282, 18.6435], 'NO': [60.4720, 8.4689], 'FI': [61.9241, 25.7482],
            'DK': [56.2639, 9.5018], 'IS': [64.9631, -19.0208], 'PL': [51.9194, 19.1451],
            'CZ': [49.8175, 15.4730], 'SK': [48.6690, 19.6990], 'HU': [47.1625, 19.5033],
            'RO': [45.9432, 24.9668], 'BG': [42.7339, 25.4858], 'GR': [39.0742, 21.8243],
            'HR': [45.1000, 15.2000], 'SI': [46.1512, 14.9955], 'RS': [44.0165, 21.0059],
            'BA': [43.9159, 17.6791], 'ME': [42.7087, 19.3744], 'MK': [41.6086, 21.7453],
            'AL': [41.1533, 20.1683], 'XK': [42.6026, 20.9030], 'UA': [48.3794, 31.1656],
            'BY': [53.7098, 27.9534], 'MD': [47.4116, 28.3699], 'RU': [61.5240, 105.3188],
            'EE': [58.5953, 25.0136], 'LV': [56.8796, 24.6032], 'LT': [55.1694, 23.8813],
            'CY': [35.1264, 33.4299], 'MT': [35.9375, 14.3754],
            'BR': [-14.2350, -51.9253], 'AR': [-38.4161, -63.6167], 'CL': [-35.6751, -71.5430],
            'CO': [4.5709, -74.2973], 'PE': [-9.1900, -75.0152], 'VE': [6.4238, -66.5897],
            'EC': [-1.8312, -78.1834], 'BO': [-16.2902, -63.5887], 'PY': [-23.4425, -58.4438],
            'UY': [-32.5228, -55.7658], 'GY': [4.8604, -58.9302], 'SR': [3.9193, -56.0278],
            'AU': [-25.2744, 133.7751], 'NZ': [-40.9006, 174.8860], 'FJ': [-17.7134, 178.0650],
            'PG': [-6.3150, 143.9555], 'NC': [-20.9043, 165.6180],
            'ZA': [-30.5595, 22.9375], 'EG': [26.8206, 30.8025], 'NG': [9.0820, 8.6753],
            'KE': [-0.0236, 37.9062], 'ET': [9.1450, 40.4897], 'MA': [31.7917, -7.0926],
            'DZ': [28.0339, 1.6596], 'TN': [33.8869, 9.5375], 'LY': [26.3351, 17.2283],
            'SD': [12.8628, 30.2176], 'TZ': [-6.3690, 34.8888], 'UG': [1.3733, 32.2903],
            'GH': [7.9465, -1.0232], 'CI': [7.5400, -5.5471], 'SN': [14.4974, -14.4524],
            'ZW': [-19.0154, 29.1549], 'AO': [-11.2027, 17.8739], 'MZ': [-18.6657, 35.5296]
        };

        const FLAG_EMOJI = {
            'CN': '🇨🇳', 'HK': '🇭🇰', 'TW': '🇹🇼', 'MO': '🇲🇴', 'JP': '🇯🇵', 'KR': '🇰🇷', 'KP': '🇰🇵', 'SG': '🇸🇬', 'MY': '🇲🇾', 'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'IN': '🇮🇳', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦', 'NP': '🇳🇵', 'BT': '🇧🇹', 'MN': '🇲🇳', 'KZ': '🇰🇿', 'UZ': '🇺🇿', 'TM': '🇹🇲', 'KG': '🇰🇬', 'TJ': '🇹🇯', 'AF': '🇦🇫', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IL': '🇮🇱', 'JO': '🇯🇴', 'LB': '🇱🇧',
            'SY': '🇸🇾', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'TR': '🇹🇷', 'YE': '🇾🇪', 'OM': '🇴🇲', 'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'AM': '🇦🇲', 'AZ': '🇦🇿', 'GE': '🇬🇪', 'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'GT': '🇬🇹', 'BZ': '🇧🇿', 'SV': '🇸🇻', 'HN': '🇭🇳', 'NI': '🇳🇮', 'CR': '🇨🇷', 'PA': '🇵🇦', 'CU': '🇨🇺', 'JM': '🇯🇲', 'HT': '🇭🇹', 'DO': '🇩🇴', 'GB': '🇬🇧', 'IE': '🇮🇪', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'LU': '🇱🇺', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'FI': '🇫🇮', 'DK': '🇩🇰', 'IS': '🇮🇸', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'SK': '🇸🇰', 'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 'GR': '🇬🇷', 'HR': '🇭🇷', 'SI': '🇸🇮', 'RS': '🇷🇸', 'BA': '🇧🇦', 'ME': '🇲🇪', 'MK': '🇲🇰', 'AL': '🇦🇱', 'XK': '🇽🇰', 'UA': '🇺🇦', 'BY': '🇧🇾', 'MD': '🇲🇩', 'RU': '🇷🇺', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹', 'CY': '🇨🇾', 'MT': '🇲🇹', 'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'EC': '🇪🇨', 'BO': '🇧🇴', 'PY': '🇵🇾', 'UY': '🇺🇾', 'GY': '🇬🇾', 'SR': '🇸🇷', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'FJ': '🇫🇯', 'PG': '🇵🇬', 'NC': '🇳🇨', 'ZA': '🇿🇦', 'EG': '🇪🇬', 'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'LY': '🇱🇾', 'SD': '🇸🇩', 'TZ': '🇹🇿', 'UG': '🇺🇬', 'GH': '🇬🇭', 'CI': '🇨🇮', 'SN': '🇸🇳', 'ZW': '🇿🇼', 'AO': '🇦🇴', 'MZ': '🇲🇿'
        };

        const CODE_TO_CN = {
            'CN': '中国', 'HK': '香港', 'TW': '台湾', 'MO': '澳门', 'JP': '日本', 'KR': '韩国', 'KP': '朝鲜', 'SG': '新加坡', 'MY': '马来西亚', 'TH': '泰国', 'VN': '越南', 'PH': '菲律宾', 'ID': '印尼', 'IN': '印度', 'PK': '巴基斯坦', 'BD': '孟加拉国', 'LK': '斯里兰卡', 'MM': '缅甸', 'KH': '柬埔寨', 'LA': '老挝', 'NP': '尼泊尔', 'BT': '不丹', 'MN': '蒙古', 'KZ': '哈萨克斯坦', 'UZ': '乌兹别克斯坦', 'TM': '土库曼斯坦', 'KG': '吉尔吉斯斯坦', 'TJ': '塔吉克斯坦', 'AF': '阿富汗', 'AE': '阿联酋', 'SA': '沙特', 'IL': '以色列', 'JO': '约旦', 'LB': '黎巴嫩',
            'SY': '叙利亚', 'IQ': '伊拉克', 'IR': '伊朗', 'TR': '土耳其', 'YE': '也门', 'OM': '阿曼', 'KW': '科威特', 'QA': '卡塔尔', 'BH': '巴林', 'AM': '亚美尼亚', 'AZ': '阿塞拜疆', 'GE': '格鲁吉亚', 'US': '美国', 'CA': '加拿大', 'MX': '墨西哥', 'GT': '危地马拉', 'BZ': '伯利兹', 'SV': '萨尔瓦多', 'HN': '洪都拉斯', 'NI': '尼加拉瓜', 'CR': '哥斯达黎加', 'PA': '巴拿马', 'CU': '古巴', 'JM': '牙买加', 'HT': '海地', 'DO': '多米尼加', 'GB': '英国', 'IE': '爱尔兰', 'FR': '法国', 'DE': '德国', 'IT': '意大利', 'ES': '西班牙', 'PT': '葡萄牙', 'NL': '荷兰', 'BE': '比利时', 'LU': '卢森堡', 'CH': '瑞士', 'AT': '奥地利', 'SE': '瑞典', 'NO': '挪威', 'FI': '芬兰', 'DK': '丹麦', 'IS': '冰岛', 'PL': '波兰', 'CZ': '捷克', 'SK': '斯洛伐克', 'HU': '匈牙利', 'RO': '罗马尼亚', 'BG': '保加利亚', 'GR': '希腊', 'HR': '克罗地亚', 'SI': '斯洛文尼亚', 'RS': '塞尔维亚', 'BA': '波黑', 'ME': '黑山', 'MK': '北马其顿', 'AL': '阿尔巴尼亚', 'XK': '科索沃', 'UA': '乌克兰', 'BY': '白俄罗斯', 'MD': '摩尔多瓦', 'RU': '俄罗斯', 'EE': '爱沙尼亚', 'LV': '拉脱维亚', 'LT': '立陶宛', 'CY': '塞浦路斯', 'MT': '马耳他', 'BR': '巴西', 'AR': '阿根廷', 'CL': '智利', 'CO': '哥伦比亚', 'PE': '秘鲁', 'VE': '委内瑞拉', 'EC': '厄瓜多尔', 'BO': '玻利维亚', 'PY': '巴拉圭', 'UY': '乌拉圭', 'GY': '圭亚那', 'SR': '苏里南', 'AU': '澳大利亚', 'NZ': '新西兰', 'FJ': '斐济', 'PG': '巴新', 'NC': '新喀里多尼亚', 'ZA': '南非', 'EG': '埃及', 'NG': '尼日利亚', 'KE': '肯尼亚', 'ET': '埃塞俄比亚', 'MA': '摩洛哥', 'DZ': '阿尔及利亚', 'TN': '突尼斯', 'LY': '利比亚', 'SD': '苏丹', 'TZ': '坦桑尼亚', 'UG': '乌干达', 'GH': '加纳', 'CI': '科特迪瓦', 'SN': '塞内加尔', 'ZW': '津巴布韦', 'AO': '安哥拉', 'MZ': '莫桑比克'
        };

        // DOM元素
        const overlay = document.querySelector('.earth-modal-overlay');
        const renderArea = document.getElementById('earth-render-area');
        const toggleBtn = document.getElementById('earth-toggle-btn');
        const closeBtn = document.getElementById('earth-close-btn');
        const serverCountEl = document.getElementById('server-count');
        const countEl = document.getElementById('country-count');
        const statusEl = document.getElementById('globe-status');
        const debugPanel = document.getElementById('debug-panel');
        const toggleDebug = document.getElementById('toggle-debug');
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');

        // 检查必要元素
        if (!toggleBtn || !overlay) {
            console.warn('[3D Globe] Required DOM elements not found');
            return;
        }

        let globeInstance = null;
        let isActive = false;
        let isDayMode = false;
        let updateTimer = null;
        let lastDetectedFlags = [];
        let scanRetryCount = 0;
        let debugLogs = [];
        const MAX_RETRY = 3;
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

        let dataCache = {
            points: [], arcs: [], codes: [], serverCount: 0, timestamp: 0, ttl: 60000
        };

        let visitorLocation = null;

        // 主题切换
        function toggleTheme() {
            isDayMode = !isDayMode;
            if (isDayMode) {
                themeIcon.textContent = '☀️';
                themeText.textContent = 'DAY';
                if (globeInstance) {
                    globeInstance.globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg');
                    globeInstance.atmosphereColor('rgba(135, 206, 250, 0.75)');
                }
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = 'NIGHT';
                if (globeInstance) {
                    globeInstance.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg');
                    globeInstance.atmosphereColor('rgba(26, 84, 144, 0.8)');
                }
            }
        }

        function toggle() {
            isActive = !isActive;
            if (isActive) {
                overlay.classList.add('active');
                toggleBtn.classList.add('hidden');
                debugLogs = [];
                scanRetryCount = 0;
                setTimeout(() => initGlobe(), isMobile ? 800 : 400);

                if (globeInstance && globeInstance.resumeAnimation) {
                    globeInstance.resumeAnimation();
                    // 恢复自动旋转
                    if (globeInstance.controls) {
                        globeInstance.controls().autoRotate = true;
                    }
                }

                if (updateTimer) clearInterval(updateTimer);
                updateTimer = setInterval(() => {
                    if (isActive && globeInstance) updateGlobe();
                }, 30000);
            } else {
                overlay.classList.remove('active');
                toggleBtn.classList.remove('hidden');

                if (globeInstance) {
                    if (globeInstance.pauseAnimation) globeInstance.pauseAnimation();
                    if (globeInstance.controls) globeInstance.controls().autoRotate = false;
                }

                if (updateTimer) {
                    clearInterval(updateTimer);
                    updateTimer = null;
                }
            }
        }

        function addDebugLog(msg) {
            const timestamp = new Date().toLocaleTimeString();
            debugLogs.push(`[${timestamp}] ${msg}`);
            if (debugLogs.length > 100) debugLogs.shift();
            if (debugPanel) {
                debugPanel.innerHTML = debugLogs.slice(-30).map(log => `<div>${log}</div>`).join('');
                debugPanel.scrollTop = debugPanel.scrollHeight;
            }
            console.log(msg);
        }

        if (toggleDebug) {
            toggleDebug.addEventListener('click', () => {
                debugPanel.classList.toggle('show');
                toggleDebug.textContent = debugPanel.classList.contains('show') ? '[Hide Debug Info]' : '[Show Debug Info]';
            });
        }

        function scanFlags() {
            const flags = new Set();
            let uniqueServers = new Set();

            addDebugLog('=== Emoji Flag Scan V14.0 ===');

            const searchArea = document.querySelector('main, #app, .content') || document.body;
            searchArea.querySelectorAll('span').forEach(el => {
                if (el.closest('header, footer, nav, .earth-modal-overlay')) return;
                const text = el.textContent.trim();
                if (!/[\u{1F1E6}-\u{1F1FF}]/u.test(text)) return;

                Object.keys(FLAG_EMOJI).forEach(code => {
                    if (text === FLAG_EMOJI[code] || text.includes(FLAG_EMOJI[code])) {
                        flags.add(code);
                        const serverCard = el.closest('section, article, [class*="server"]');
                        if (serverCard && !uniqueServers.has(serverCard)) {
                            uniqueServers.add(serverCard);
                        }
                    }
                });
            });

            if (flags.size === 0) {
                const fullText = document.body.innerText;
                Object.keys(FLAG_EMOJI).forEach(code => {
                    if (fullText.includes(FLAG_EMOJI[code])) flags.add(code);
                });
            }

            addDebugLog(`=== FINAL: ${flags.size} countries ===`);
            console.log('[Globe V14] Detected countries:', Array.from(flags).sort());

            return { flags: Array.from(flags).sort(), serverCount: uniqueServers.size };
        }

        async function detectVisitorLocation() {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code && COORD_MAP[data.country_code.toUpperCase()]) {
                    const code = data.country_code.toUpperCase();
                    const coord = COORD_MAP[code];
                    visitorLocation = { code, lat: coord[0], lng: coord[1], name: CODE_TO_CN[code] || code };
                    addDebugLog(`✓ You are in: ${visitorLocation.name}`);
                    return visitorLocation;
                }
            } catch (e) { addDebugLog(`✗ Location API failed`); }

            visitorLocation = { code: 'CN', lat: 35.8617, lng: 104.1954, name: '中国' };
            return visitorLocation;
        }

        async function generateData() {
            const { flags: codes, serverCount } = scanFlags();
            const points = [];
            const arcs = [];

            if (codes.length === 0) return { points, arcs, codes, serverCount: 0 };

            if (!visitorLocation) await detectVisitorLocation();

            codes.forEach(code => {
                const coord = COORD_MAP[code];
                if (coord) points.push({ code, lat: coord[0], lng: coord[1] });
            });

            if (visitorLocation && !codes.includes(visitorLocation.code)) {
                points.push({ code: visitorLocation.code, lat: visitorLocation.lat, lng: visitorLocation.lng, isVisitor: true });
            }

            if (visitorLocation) {
                codes.forEach(code => {
                    if (code === visitorLocation.code) return;
                    const coord = COORD_MAP[code];
                    if (coord) {
                        arcs.push({
                            startLat: visitorLocation.lat, startLng: visitorLocation.lng,
                            endLat: coord[0], endLng: coord[1]
                        });
                    }
                });
            }

            return { points, arcs, codes, serverCount };
        }

        async function initGlobe(isRetry = false) {
            if (globeInstance && !isRetry) { updateGlobe(); return; }
            if (statusEl) statusEl.textContent = 'Scanning';

            const { points, arcs, codes, serverCount } = await generateData();

            if (codes.length === 0) {
                if (scanRetryCount < MAX_RETRY - 1) {
                    scanRetryCount++;
                    if (statusEl) statusEl.textContent = `Retry ${scanRetryCount}`;
                    setTimeout(() => initGlobe(true), 1500);
                    return;
                }
                if (statusEl) statusEl.textContent = 'No Data';
                if (countEl) countEl.textContent = '0';
                return;
            }

            scanRetryCount = 0;
            if (serverCountEl) serverCountEl.textContent = serverCount || 0;
            if (countEl) countEl.textContent = codes.length;
            lastDetectedFlags = codes;

            try {
                if (globeInstance) {
                    renderArea.innerHTML = '';
                    globeInstance = null;
                }

                const globe = Globe();
                globe(renderArea);
                globe.width(renderArea.clientWidth);
                globe.height(renderArea.clientHeight);
                globe.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');
                globe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg');
                globe.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');
                globe.atmosphereColor('rgba(26, 84, 144, 0.8)');
                globe.atmosphereAltitude(0.25);
                globe.ringsData(points);
                globe.ringColor(() => '#00ffff');
                globe.ringMaxRadius(5);
                globe.ringPropagationSpeed(3);
                globe.ringRepeatPeriod(800);
                globe.pointsData(points);
                globe.pointColor(() => '#00ffff');
                globe.pointAltitude(0.02);
                globe.pointRadius(0.5);
                globe.htmlElementsData(points);
                globe.htmlElement(d => {
                    const el = document.createElement('div');
                    const emoji = FLAG_EMOJI[d.code] || '🏁';
                    const cnName = CODE_TO_CN[d.code] || d.code;
                    el.innerHTML = `<div class="earth-label-card"><span class="flag-emoji">${emoji}</span><b>${cnName}</b></div>`;
                    return el;
                });
                globe.htmlLat(d => d.lat);
                globe.htmlLng(d => d.lng);
                globe.htmlAltitude(0.01);
                globe.arcsData(arcs);
                globe.arcColor(() => ['rgba(0, 255, 255, 0.5)', 'rgba(255, 0, 255, 0.5)']);
                globe.arcDashLength(0.7);
                globe.arcDashGap(0.2);
                globe.arcDashAnimateTime(2000);
                globe.arcStroke(1.2);
                globe.arcAltitude(0.3);
                globe.pointOfView({ lat: codes.includes('CN') ? 35 : 20, lng: codes.includes('CN') ? 110 : 0, altitude: 2.5 });
                globe.controls().autoRotate = true;
                globe.controls().autoRotateSpeed = 0.8;
                globe.controls().enableZoom = true;
                globeInstance = globe;
                if (statusEl) statusEl.textContent = 'Active';
            } catch (error) {
                if (statusEl) statusEl.textContent = 'Error';
                addDebugLog(`Error: ${error.message}`);
            }
        }

        async function updateGlobe() {
            if (!globeInstance) return;
            const now = Date.now();
            if (now - dataCache.timestamp < dataCache.ttl) return;

            const { points, arcs, codes, serverCount } = await generateData();
            if (JSON.stringify(codes.sort()) === JSON.stringify(lastDetectedFlags.sort())) {
                dataCache.timestamp = now;
                return;
            }

            dataCache = { points, arcs, codes, serverCount, timestamp: now, ttl: 60000 };
            lastDetectedFlags = codes;
            if (serverCountEl) serverCountEl.textContent = serverCount || 0;
            if (countEl) countEl.textContent = codes.length;

            globeInstance.ringsData(points);
            globeInstance.pointsData(points);
            globeInstance.htmlElementsData(points);
            globeInstance.arcsData(arcs);
        }

        // 事件绑定
        toggleBtn.addEventListener('click', toggle);
        if (closeBtn) closeBtn.addEventListener('click', toggle);
        if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

        // Resize防抖
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (isActive && globeInstance) {
                    globeInstance.width(renderArea.clientWidth);
                    globeInstance.height(renderArea.clientHeight);
                }
            }, 250);
        });

        // 页面卸载清理
        window.addEventListener('beforeunload', () => {
            if (updateTimer) { clearInterval(updateTimer); updateTimer = null; }
            if (globeInstance && globeInstance.pauseAnimation) globeInstance.pauseAnimation();
        });

        console.log('[3D Globe] V14.0 Ultimate Edition (Self-Contained) Loaded ✓');
    }
})();
