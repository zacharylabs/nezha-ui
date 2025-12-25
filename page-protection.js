/**
 * 页面保护脚本 - 防止内容被轻易复制
 * 优化版 v2.1 (严格模式)
 * 
 * 更新日期: 2025-12-26
 * 
 * 功能:
 * - 禁用右键、开发者工具快捷键、文本选择、拖拽等
 * - 支持 Mac/Windows/Linux
 * - 频繁违规检测 (5秒内3次→自动关闭页面)
 * - 使用现代API (key 替代 keyCode)
 * - 完整的资源清理机制
 * 
 * 优化项:
 * - ✅ 使用 key/code 替代已废弃的 keyCode
 * - ✅ 添加 Mac 系统支持 (Cmd键)
 * - ✅ 添加频繁违规检测和惩罚机制
 * - ✅ 事件监听器引用保存 (可清理)
 * - ✅ 代码结构优化
 * - ✅ v2.1: 严格模式 (3次/5秒)
 */

(function () {
    'use strict';

    // ========== 配置项 ==========
    const CONFIG = {
        // 是否启用域名限制 (false = 所有域名都生效)
        enableDomainCheck: false,
        // 允许的域名列表
        allowedDomains: ['localhost', '127.0.0.1', 'vps.thesecondbrain.de', 'vps.zacharylabs.com'],
        // 是否显示弹窗提示
        showAlerts: true,
        // 是否禁用右键菜单
        disableContextMenu: true,
        // 是否禁用文本选择
        disableTextSelection: true,
        // 是否禁用开发者工具快捷键
        disableDevTools: true,
        // 是否禁用拖拽
        disableDragDrop: true,
        // 是否禁用打印快捷键
        disablePrint: true,

        // 频繁违规检测配置 - 严格模式
        enableViolationDetection: true,    // 是否启用违规检测
        violationThreshold: 3,              // 违规次数阈值 (3次，更严格)
        violationTimeWindow: 5000,          // 时间窗口 (ms) - 5秒内 (更短)
        closePageOnViolation: true          // 达到阈值是否关闭页面
    };

    // ========== 系统检测 ==========
    const isMac = /Mac/.test(navigator.platform);
    const userAgent = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobi/i.test(userAgent) ||
        (/Macintosh/i.test(userAgent) && (navigator.maxTouchPoints || 0) > 1);

    // ========== 违规检测系统 ==========
    const violationTracker = {
        violations: [],

        // 记录违规
        record(type) {
            if (!CONFIG.enableViolationDetection) return;

            const now = Date.now();
            this.violations.push({ type, time: now });

            // 清理过期记录
            this.violations = this.violations.filter(v =>
                now - v.time < CONFIG.violationTimeWindow
            );

            // 检查是否达到阈值
            if (this.violations.length >= CONFIG.violationThreshold) {
                this.handleExcessiveViolations();
            }

            console.warn(`[保护] 违规行为: ${type}, 当前计数: ${this.violations.length}/${CONFIG.violationThreshold}`);
        },

        // 处理频繁违规
        handleExcessiveViolations() {
            console.error('[保护] 检测到频繁违规行为！');

            if (CONFIG.closePageOnViolation) {
                alert('检测到频繁违规操作，页面即将关闭！');

                // 延迟关闭以确保用户看到提示
                setTimeout(() => {
                    // 尝试多种关闭方式
                    window.close();
                    window.location.href = 'about:blank';
                    document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">页面已关闭</h1>';
                }, 1000);
            }
        },

        // 清空记录
        reset() {
            this.violations = [];
        }
    };

    // ========== 事件处理器集合 (便于清理) ==========
    const eventHandlers = {
        listeners: [],

        add(element, event, handler, options) {
            this.listeners.push({ element, event, handler, options });
            element.addEventListener(event, handler, options);
        },

        removeAll() {
            this.listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            this.listeners = [];
        }
    };

    // ========== 域名检查 ==========
    if (CONFIG.enableDomainCheck) {
        const currentDomain = window.location.hostname;
        const isAllowed = CONFIG.allowedDomains.some(domain =>
            currentDomain === domain || currentDomain.endsWith('.' + domain)
        );

        if (!isAllowed) {
            console.warn('[保护] 当前域名未授权');
            return;
        }
    }

    // ========== 1. 禁用右键菜单 ==========
    if (CONFIG.disableContextMenu) {
        const handleContextMenu = (e) => {
            e.preventDefault();

            // 记录违规
            violationTracker.record('右键菜单');

            if (CONFIG.showAlerts) {
                alert('右键功能已被禁用');
            }
            return false;
        };

        eventHandlers.add(document, 'contextmenu', handleContextMenu, false);
    }

    // ========== 2. 禁用开发者工具快捷键 ==========
    if (CONFIG.disableDevTools) {
        const handleKeyDown = (e) => {
            // 辅助函数：检测Cmd(Mac)或Ctrl(Win/Linux)
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            let blocked = false;
            let message = '';

            // F12 开发者工具
            if (e.key === 'F12') {
                blocked = true;
                message = 'F12已被禁用';
            }
            // Cmd/Ctrl+Shift+I (开发者工具)
            else if (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
                blocked = true;
                message = '开发者工具快捷键已被禁用';
            }
            // Cmd/Ctrl+Shift+C (检查元素)
            else if (cmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
                blocked = true;
                message = '检查元素快捷键已被禁用';
            }
            // Cmd/Ctrl+Shift+J (控制台)
            else if (cmdOrCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
                blocked = true;
                message = '控制台快捷键已被禁用';
            }
            // Cmd/Ctrl+U (查看源代码)
            else if (cmdOrCtrl && (e.key === 'U' || e.key === 'u')) {
                blocked = true;
                message = '查看源代码已被禁用';
            }
            // Cmd/Ctrl+S (保存页面)
            else if (cmdOrCtrl && (e.key === 'S' || e.key === 's')) {
                blocked = true;
                message = '保存页面已被禁用';
            }
            // Cmd/Ctrl+P (打印)
            else if (CONFIG.disablePrint && cmdOrCtrl && (e.key === 'P' || e.key === 'p')) {
                blocked = true;
                message = '打印已被禁用';
            }

            if (blocked) {
                e.preventDefault();

                // 记录违规
                violationTracker.record('快捷键');

                if (CONFIG.showAlerts && message) {
                    alert(message);
                }
                return false;
            }
        };

        eventHandlers.add(document, 'keydown', handleKeyDown, false);
    }

    // ========== 3. 禁用文本选择 ==========
    if (CONFIG.disableTextSelection) {
        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        const handleMouseDown = (e) => {
            if (e.button === 2) { // 右键
                e.preventDefault();
                return false;
            }
        };

        eventHandlers.add(document, 'selectstart', handleSelectStart, false);
        eventHandlers.add(document, 'mousedown', handleMouseDown, false);
    }

    // ========== 4. 禁用拖拽 ==========
    if (CONFIG.disableDragDrop) {
        const handleDragStart = (e) => {
            e.preventDefault();

            // 记录违规
            violationTracker.record('拖拽');

            return false;
        };

        const handleDrop = (e) => {
            e.preventDefault();
            return false;
        };

        eventHandlers.add(document, 'dragstart', handleDragStart, false);
        eventHandlers.add(document, 'drop', handleDrop, false);
    }

    // ========== 5. 注入保护CSS ==========
    function injectProtectionCSS() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'page-protection-style';

        let css = '';

        // 基础保护
        if (CONFIG.disableTextSelection) {
            css += `
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `;
        }

        if (CONFIG.disableDragDrop) {
            css += `
        body, img {
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
      `;
        }

        // 移动端额外保护
        if (isMobile) {
            css += `
        img {
          -webkit-touch-callout: none !important;
          pointer-events: none !important;
        }
        
        a img {
          pointer-events: auto !important;
        }
      `;
        }

        style.innerHTML = css;
        document.head.appendChild(style);
    }

    // ========== 6. 移动端图片长按保护 ==========
    if (isMobile) {
        const handleMobileContextMenu = (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                violationTracker.record('移动端长按');
                return false;
            }
        };

        eventHandlers.add(document, 'contextmenu', handleMobileContextMenu, true);
    }

    // ========== 7. 开发者工具检测 (可选) ==========
    function detectDevTools() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            console.warn('[保护] 检测到开发者工具可能已打开');
            violationTracker.record('开发者工具');
        }
    }

    // 每秒检测一次 (可选功能)
    // const devToolsInterval = setInterval(detectDevTools, 1000);

    // ========== 8. 初始化 ==========
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                injectProtectionCSS();
            });
        } else {
            injectProtectionCSS();
        }

        console.log(`[保护] 页面保护已启用 (v2.1 严格模式)`);
        console.log(`[保护] 系统: ${isMac ? 'macOS' : 'Windows/Linux'}, 移动端: ${isMobile}`);
        console.log(`[保护] 违规检测: ${CONFIG.enableViolationDetection ? '启用' : '关闭'} (阈值: ${CONFIG.violationThreshold}次/${CONFIG.violationTimeWindow / 1000}秒) ⚠️ 严格`);
    }

    // 立即执行
    init();

    // ========== 9. 提供接口 ==========
    window.PageProtection = {
        // 禁用保护 (需要刷新)
        disable() {
            console.warn('[保护] 页面保护已通过控制台禁用');
            CONFIG.disableContextMenu = false;
            CONFIG.disableTextSelection = false;
            CONFIG.disableDevTools = false;
            CONFIG.disableDragDrop = false;
            CONFIG.showAlerts = false;
            CONFIG.enableViolationDetection = false;
            location.reload();
        },

        // 清理所有事件监听器
        cleanup() {
            eventHandlers.removeAll();
            violationTracker.reset();
            const style = document.getElementById('page-protection-style');
            if (style) style.remove();
            console.log('[保护] 资源已清理');
        },

        // 获取违规统计
        getViolations() {
            return {
                count: violationTracker.violations.length,
                threshold: CONFIG.violationThreshold,
                violations: violationTracker.violations
            };
        },

        // 重置违规计数
        resetViolations() {
            violationTracker.reset();
            console.log('[保护] 违规计数已重置');
        }
    };

    // 兼容旧接口
    window.disablePageProtection = window.PageProtection.disable;

})();
