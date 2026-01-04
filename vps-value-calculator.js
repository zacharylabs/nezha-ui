/**
 * ============================================
 * VPS 价值计算器
 * ============================================
 * 版本: v2.0.0 (Optimized & Self-Contained)
 * 
 * 功能：
 * - 自动计算 Nezha Dashboard 中 VPS 的剩余价值
 * - CSS 自动注入，无需手动添加样式
 * - 支持多种货币符号（HK$, US$, C$, A$, €, £, ¥, $）
 * - 根据剩余价值占比显示不同颜色标签
 * - 支持月付/年付周期计算
 * - 鼠标悬停显示详细信息
 * 
 * 使用方法：
 * - 通过CDN引用：
 *    <script src="https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/vps-value-calculator.js"></script>
 * 
 * 全局API：
 * - window.recalculateVPSValues()  // 手动重新计算
 * - window.setCurrency('HK$')      // 设置默认货币符号
 * - window.setTagText('剩余')      // 设置标签前缀文字
 * - window.setTagPosition('last')  // 设置标签位置（first/last）
 * 
 * ============================================
 */

/* ============================================
   CSS 样式会自动注入，无需手动添加
   ============================================ */

(function () {
    'use strict';

    // === 单例检查 ===
    if (window.vpsValueCalculatorLoaded) {
        console.warn('[VPS Calculator] 模块已加载，跳过重复初始化');
        return;
    }
    window.vpsValueCalculatorLoaded = true;

    // === CSS 自动注入 ===
    const CSS_STYLES = `
.vps-value-tag {
  font-size: 9px;
  font-weight: 400;
  padding: 1.5px 3px;
  border-radius: 5px;
  margin: 0;
  width: fit-content;
  display: inline-block;
  cursor: help;
  position: relative;
}

/* 亮色模式 - 实色背景 */
.vps-value-tag.excellent {
  background-color: rgb(22, 163, 74);
  color: rgb(187, 247, 208);
}

.vps-value-tag.good {
  background-color: rgb(34, 197, 94);
  color: rgb(187, 247, 208);
}

.vps-value-tag.moderate {
  background-color: rgb(234, 179, 8);
  color: rgb(254, 240, 138);
}

.vps-value-tag.low {
  background-color: rgb(239, 68, 68);
  color: rgb(254, 202, 202);
}

.vps-value-tag.very-low {
  background-color: rgb(220, 38, 38);
  color: rgb(254, 202, 202);
}

.vps-value-tag.expired {
  background-color: rgb(156, 163, 175);
  color: rgb(229, 231, 235);
}

/* 暗色模式 - 实色背景 */
html.dark .vps-value-tag.excellent,
.dark .vps-value-tag.excellent {
  background-color: rgb(22, 101, 52);
  color: rgb(134, 239, 172);
}

html.dark .vps-value-tag.good,
.dark .vps-value-tag.good {
  background-color: rgb(20, 83, 45);
  color: rgb(134, 239, 172);
}

html.dark .vps-value-tag.moderate,
.dark .vps-value-tag.moderate {
  background-color: rgb(161, 98, 7);
  color: rgb(253, 224, 71);
}

html.dark .vps-value-tag.low,
.dark .vps-value-tag.low {
  background-color: rgb(153, 27, 27);
  color: rgb(252, 165, 165);
}

html.dark .vps-value-tag.very-low,
.dark .vps-value-tag.very-low {
  background-color: rgb(127, 29, 29);
  color: rgb(252, 165, 165);
}

html.dark .vps-value-tag.expired,
.dark .vps-value-tag.expired {
  background-color: rgb(75, 85, 99);
  color: rgb(209, 213, 219);
}

/* 悬停效果 - 柔和 */
.vps-value-tag:hover {
  opacity: 0.85;
}

/* ============ 液态玻璃Tooltip ============ */
.vps-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-line;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 220px;
  
  /* 液态玻璃效果 - 亮色模式 */
  background: transparent linear-gradient(135deg, 
    rgba(255, 255, 255, .45) 0%, 
    rgba(255, 255, 255, .1) 40%, 
    rgba(255, 255, 255, .05) 60%, 
    rgba(255, 255, 255, .25) 100%);
  backdrop-filter: blur(5px) saturate(150%);
  -webkit-backdrop-filter: blur(5px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, .5);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, .08),
    inset 0 1px 2px rgba(255, 255, 255, .6);
  color: rgba(0, 0, 0, 0.9);
  
  /* 亮色模式 - 移除白色阴影，文字更清晰 */
  text-shadow: none;
}

.vps-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}

/* 暗色模式tooltip */
html.dark .vps-tooltip,
.dark .vps-tooltip {
  background: linear-gradient(135deg,
    rgba(28, 28, 30, .85) 0%,
    rgba(28, 28, 30, .7) 50%,
    rgba(28, 28, 30, .75) 100%);
  backdrop-filter: blur(6px) saturate(150%);
  -webkit-backdrop-filter: blur(6px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, .15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, .3),
    inset 0 1px 1px rgba(255, 255, 255, .1);
  color: rgba(255, 255, 255, 0.92);
  
  /* 暗色模式移除文字阴影 */
  text-shadow: none;
}

/* Tooltip内容样式 */
.vps-tooltip strong {
  font-weight: 700;
  color: inherit;
}
`;

    // 注入CSS到页面
    if (!document.getElementById('vps-value-calculator-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'vps-value-calculator-styles';
        styleElement.textContent = CSS_STYLES;
        document.head.appendChild(styleElement);
    }

    // === 创建Tooltip元素 ===
    let tooltipElement = null;
    function createTooltip() {
        if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'vps-tooltip';
            document.body.appendChild(tooltipElement);
        }
        return tooltipElement;
    }

    function showTooltip(element, content, event) {
        const tooltip = createTooltip();
        tooltip.innerHTML = content;
        tooltip.classList.add('show');

        // 定位tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

        // 边界检测
        const tooltipRect = tooltip.getBoundingClientRect();
        if (tooltipRect.left < 5) {
            tooltip.style.left = '5px';
        }
        if (tooltipRect.right > window.innerWidth - 5) {
            tooltip.style.left = (window.innerWidth - tooltipRect.width - 5) + 'px';
        }
        if (tooltipRect.top < 5) {
            tooltip.style.top = rect.bottom + 8 + 'px';
        }
    }

    function hideTooltip() {
        if (tooltipElement) {
            tooltipElement.classList.remove('show');
        }
    }

    // === 事件委托（优化内存管理）===
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.matches('.vps-value-tag')) {
            try {
                const details = JSON.parse(e.target.dataset.details || '{}');
                if (details.value) {
                    showTooltip(e.target, generateTooltipHTML(details), e);
                }
            } catch (err) {
                console.warn('[VPS Calculator] Tooltip解析失败:', err);
            }
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.matches('.vps-value-tag')) {
            hideTooltip();
        }
    }, true);

    // === 防抖函数（优化性能）===
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // === 配置 ===
    const CONFIG = {
        tagText: '剩余',
        tagPosition: 'last',
        currency: '$',
        MAX_CARDS: 500,
        PERFORMANCE_WARN_MS: 100
    };
    const EXPIRED_KEYWORDS = ['已过期', '已到期', '过期', '到期'];

    // 支持的货币符号
    const CURRENCY_SYMBOLS = ['HK$', 'US$', 'C$', 'A$', '€', '£', '¥', '￥', '$'];

    // === 缓存的正则表达式（性能优化）===
    const REGEX_PATTERNS = {
        oneTime: /价格:\s*((?:HK\$|US\$|C\$|A\$|€|£|¥|￥|\$)?\s*[\d.,]+)\/-/,
        free: /价格:\s*(免费|Free|0)/i,
        normal: /价格:\s*((?:HK\$|US\$|C\$|A\$|€|£|¥|￥|\$)?\s*[\d.,]+)\s*[\/]?\s*(年|每年|年付|yr|year|月|每月|月付|mo|month)?/i,
        days: /剩余天数:\s*(\d+)/,
        permanent: /剩余天数:\s*永久/i,
        periodYear: /年|yr|year/i
    };

    function processVPS(force = false) {
        const startTime = performance.now();  // 性能监控

        // 强制重算：清理旧标签和标记
        if (force) {
            document.querySelectorAll('[data-processed]').forEach(card => {
                card.removeAttribute('data-processed');
                card.querySelectorAll('.vps-value-tag').forEach(tag => tag.remove());
            });
        }

        // 修复选择器：支持 bg-card/70 等 Tailwind 语法
        let cards = Array.from(document.querySelectorAll('[class*="bg-card"]:not([data-processed])'));

        // 数量限制保护
        if (cards.length > CONFIG.MAX_CARDS) {
            console.warn(`[VPS Calculator] 卡片数量过多 (${cards.length})，仅处理前 ${CONFIG.MAX_CARDS} 个`);
            cards = cards.slice(0, CONFIG.MAX_CARDS);
        }

        cards.forEach(card => {
            try {
                const text = card.textContent;
                const price = extractPrice(text);

                if (!price || price.free || price.oneTime) {
                    card.setAttribute('data-processed', 'true');
                    return;
                }

                if (checkExpired(text)) {
                    addTag(card, CONFIG.currency + '0.00', 'expired', { ...price, expired: true });
                    return;
                }

                const days = extractDays(text);
                if (!days || days === Infinity) {
                    card.setAttribute('data-processed', 'true');
                    return;
                }

                const remaining = calculateRemaining(price.value, days, price.period);
                if (remaining === null || remaining === Infinity) {
                    card.setAttribute('data-processed', 'true');
                    return;
                }

                const display = (price.symbol || CONFIG.currency) + remaining.toFixed(2);
                const style = getValueStyle(remaining, price.value);

                addTag(card, display, style, { ...price, days, remaining });

            } catch (e) { console.warn('[VPS Calculator] 处理出错:', e, card); }
        });

        // 性能监控
        const duration = performance.now() - startTime;
        if (duration > CONFIG.PERFORMANCE_WARN_MS) {
            console.warn(`[VPS Calculator] 处理耗时: ${duration.toFixed(2)}ms (卡片数: ${cards.length})`);
        }
    }

    function extractPrice(text) {
        // 一次性付费（使用缓存的正则）
        const oneTimeMatch = text.match(REGEX_PATTERNS.oneTime);
        if (oneTimeMatch) return parsePrice(oneTimeMatch[1], true);

        // 免费
        if (REGEX_PATTERNS.free.test(text)) return { free: true };

        // 正常价格（使用缓存的正则）
        const normalMatch = text.match(REGEX_PATTERNS.normal);
        if (normalMatch) {
            const periodText = normalMatch[2];
            let period = '月'; // 默认月付

            // 判断是否为年付（使用缓存的正则）
            if (periodText && REGEX_PATTERNS.periodYear.test(periodText)) {
                period = '年';
            }

            return parsePrice(normalMatch[1], false, period);
        }

        return null;
    }

    function parsePrice(str, oneTime = false, period = '月') {
        // 提取货币符号
        let symbol = CONFIG.currency;
        let valueStr = str;

        // 检查是否包含已知货币符号
        for (const currency of CURRENCY_SYMBOLS) {
            if (str.startsWith(currency)) {
                symbol = currency;
                valueStr = str.substring(currency.length).trim();
                break;
            }
        }

        // 清理数字字符串（移除逗号）
        const cleanValueStr = valueStr.replace(/,/g, '');
        const value = parseFloat(cleanValueStr);

        return {
            value,
            symbol,
            free: false,
            oneTime,
            period: period === '年' ? 'year' : 'month'
        };
    }

    function checkExpired(text) {
        return EXPIRED_KEYWORDS.some(keyword => text.includes(keyword));
    }

    function extractDays(text) {
        if (checkExpired(text)) return null;
        if (REGEX_PATTERNS.permanent.test(text)) return Infinity;

        const match = text.match(REGEX_PATTERNS.days);
        return match ? parseInt(match[1]) : null;
    }

    function calculateRemaining(price, days, period) {
        const daily = period === 'year' ? price / 365 : price / 30;
        return daily * days;
    }

    function getValueStyle(remaining, original) {
        if (remaining === 0) return 'expired';

        const ratio = (remaining / original) * 100;
        if (ratio > 75) return 'excellent';
        if (ratio > 50) return 'good';
        if (ratio > 25) return 'moderate';
        if (ratio > 10) return 'low';
        return 'very-low';
    }

    function addTag(card, display, style, details) {
        const tag = document.createElement('p');
        tag.className = `vps-value-tag ${style}`;
        tag.textContent = `${CONFIG.tagText}${display}`;

        // 存储details到data属性（事件委托使用）
        tag.dataset.details = JSON.stringify(details);

        const container = card.querySelector('section.flex.gap-1.items-center.flex-wrap.mt-0\\.5');
        if (!container) return;

        CONFIG.tagPosition === 'first' ? container.prepend(tag) : container.appendChild(tag);
        card.setAttribute('data-processed', 'true');
    }

    function generateTooltipHTML(details) {
        if (details.expired) {
            return `<strong>⚠️ 已过期VPS</strong><br>💰 价格: ${details.symbol}${details.value}/${details.period === 'year' ? '年' : '月'}`;
        }

        const period = details.period === 'year' ? '年' : '月';
        const daily = details.period === 'year' ? details.value / 365 : details.value / 30;
        const ratio = ((details.remaining / details.value) * 100).toFixed(1);

        // 计算到期日期
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + details.days);
        const expiryStr = expiryDate.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });

        return `💰 <strong>价格:</strong> ${details.symbol}${details.value}/${period}<br>` +
            `⏱️ <strong>剩余:</strong> ${details.days}天 (${ratio}%)<br>` +
            `💵 <strong>日均:</strong> ${details.symbol}${daily.toFixed(2)}<br>` +
            `📅 <strong>到期:</strong> ${expiryStr}`;
    }

    // === 初始化和观察（优化：防抖+精确监听）===
    setTimeout(processVPS, 1000);

    if (typeof MutationObserver !== 'undefined') {
        // 尝试找到更精确的服务器列表容器
        const serverList = document.querySelector('.server-overview, .server-list, [class*="server-info"]');
        const targetContainer = serverList || document.body;

        // 使用防抖优化性能
        const debouncedProcess = debounce(processVPS, 500);

        new MutationObserver(() => debouncedProcess())
            .observe(targetContainer, {
                childList: true,
                subtree: serverList ? false : true  // 如果找到精确容器，只监听直接子节点
            });

        console.log(`[VPS Calculator] ✓ 已加载 | 监听容器: ${targetContainer.className || 'body'}`);
    }

    // === 全局API ===
    window.recalculateVPSValues = (force = false) => processVPS(force);
    window.setCurrency = symbol => { CONFIG.currency = symbol || '$'; processVPS(true); };
    window.setTagText = text => { CONFIG.tagText = text; processVPS(true); };
    window.setTagPosition = pos => {
        if (pos === 'first' || pos === 'last') {
            CONFIG.tagPosition = pos;
            processVPS(true);
        }
    };
})();

