/**
 * Site Uptime - JavaScript
 * 网站运行时长显示组件
 * 
 * 功能：
 * - 实时计算网站运行时长
 * - 集成不蒜子访客统计
 * - 自动隐藏功能
 * - 性能优化（DOM缓存、定时器控制）
 * 
 * 依赖：
 * - 不蒜子统计脚本（可选）
 * 
 * CDN: https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/site-uptime.js
 */

(function () {
    'use strict';

    // ==================== 配置区 ====================
    const CONFIG = {
        // 网站建站日期（请修改为你的实际建站日期）
        START_DATE: '2026-01-01 00:00:00',

        // 显示内容配置
        DISPLAY: {
            showIcon: true,
            showSeconds: true,
            autoHide: false,
            autoHideDelay: 10000
        }
    };

    // ==================== 状态管理 ====================
    let elements = null;
    let updateTimer = null;
    let hasWarned = false;

    // ==================== 创建 HTML 结构 ====================
    function createUptimeHTML() {
        const container = document.createElement('div');
        container.id = 'site-uptime-container';
        container.className = 'site-uptime-container';

        container.innerHTML = `
      <div class="uptime-glass-card">
        ${CONFIG.DISPLAY.showIcon ? '<span class="uptime-icon">⏱</span>' : ''}
        <div class="uptime-content">
          <span class="uptime-label">已运行</span>
          <div class="uptime-time">
            <span class="time-segment">
              <span class="time-value" id="uptime-days">0</span>
              <span class="time-unit">天</span>
            </span>
            <span class="time-segment">
              <span class="time-value" id="uptime-hours">0</span>
              <span class="time-unit">时</span>
            </span>
            <span class="time-segment">
              <span class="time-value" id="uptime-minutes">0</span>
              <span class="time-unit">分</span>
            </span>
            ${CONFIG.DISPLAY.showSeconds ? `
            <span class="time-segment">
              <span class="time-value" id="uptime-seconds">0</span>
              <span class="time-unit">秒</span>
            </span>
            ` : ''}
          </div>
          <span class="uptime-label" style="margin-left: 8px;">第</span>
          <span class="time-value" id="busuanzi_value_site_uv" style="min-width: auto;">--</span>
          <span class="uptime-label">位访客</span>
        </div>
      </div>
    `;

        document.body.appendChild(container);

        elements = {
            days: document.getElementById('uptime-days'),
            hours: document.getElementById('uptime-hours'),
            minutes: document.getElementById('uptime-minutes'),
            seconds: document.getElementById('uptime-seconds')
        };

        return container;
    }

    // ==================== 计算运行时长 ====================
    function calculateUptime() {
        const startDate = new Date(CONFIG.START_DATE);
        const now = new Date();
        const diff = now - startDate;

        if (diff < 0) {
            if (!hasWarned) {
                console.warn('[Uptime] 建站日期晚于当前时间，将显示0');
                hasWarned = true;
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return {
            days: days,
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60
        };
    }

    // ==================== 更新显示 ====================
    function updateDisplay() {
        if (!elements) return;

        const uptime = calculateUptime();

        if (elements.days) elements.days.textContent = uptime.days;
        if (elements.hours) elements.hours.textContent = String(uptime.hours).padStart(2, '0');
        if (elements.minutes) elements.minutes.textContent = String(uptime.minutes).padStart(2, '0');
        if (elements.seconds) elements.seconds.textContent = String(uptime.seconds).padStart(2, '0');
    }

    // ==================== 自动隐藏功能 ====================
    function setupAutoHide(container) {
        if (!CONFIG.DISPLAY.autoHide) return;

        let hideTimer;

        const hideCard = () => {
            container.classList.add('auto-hidden');
        };

        const showCard = () => {
            container.classList.remove('auto-hidden');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(hideCard, CONFIG.DISPLAY.autoHideDelay);
        };

        hideTimer = setTimeout(hideCard, CONFIG.DISPLAY.autoHideDelay);

        container.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            container.classList.remove('auto-hidden');
        });

        container.addEventListener('mouseleave', () => {
            hideTimer = setTimeout(hideCard, 3000);
        });
    }

    // ==================== 定时器控制 ====================
    function startTimer() {
        if (updateTimer) return;
        updateTimer = setInterval(updateDisplay, 1000);
    }

    function stopTimer() {
        if (updateTimer) {
            clearInterval(updateTimer);
            updateTimer = null;
        }
    }

    // ==================== 初始化 ====================
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        const container = createUptimeHTML();
        updateDisplay();
        startTimer();
        setupAutoHide(container);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopTimer();
            } else {
                updateDisplay();
                startTimer();
            }
        });

        window.addEventListener('beforeunload', stopTimer);

        console.log('✅ 网站运行时长组件已加载');
    }

    init();

})();
