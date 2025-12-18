/**
 * ============================================================
 * 🐟 Sakana 石蒜模拟器
 * ============================================================
 * 作者: Zachary
 * GitHub: https://github.com/ZacharyLauGitHub
 * 创建时间: 2025-12-19
 * ============================================================
 */

(function () {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        scale: 0.5,
        sakanaUrl: 'https://cdn.jsdelivr.net/npm/sakana@1.0.8',
        retryDelay: 100,
        maxRetries: 50
    };

    // ========== 注入样式 ==========
    const style = document.createElement('style');
    style.textContent = `
        html .chisato-box {
            position: fixed;
            right: 0;
            bottom: 0;
            transform-origin: 100% 100%;
        }
        html .takina-box {
            position: fixed;
            left: 0;
            bottom: 0;
            transform-origin: 0% 100%;
        }
    `;
    document.head.appendChild(style);

    // ========== 等待 body 可用 ==========
    function waitForBody(callback, retries = 0) {
        if (document.body) {
            callback();
        } else if (retries < CONFIG.maxRetries) {
            setTimeout(() => waitForBody(callback, retries + 1), CONFIG.retryDelay);
        } else {
            console.error('[Sakana Widget] 等待 body 超时');
        }
    }

    // ========== 初始化 ==========
    function init() {
        // 创建容器
        const chisatoBox = document.createElement('div');
        chisatoBox.className = 'chisato-box';
        document.body.appendChild(chisatoBox);

        const takinaBox = document.createElement('div');
        takinaBox.className = 'takina-box';
        document.body.appendChild(takinaBox);

        // 检查是否已加载 Sakana
        if (window.Sakana) {
            initCharacters();
            return;
        }

        // 加载 Sakana 库
        const script = document.createElement('script');
        script.src = CONFIG.sakanaUrl;
        script.onload = initCharacters;
        script.onerror = () => console.error('[Sakana Widget] 加载 Sakana 库失败');
        document.head.appendChild(script);
    }

    // ========== 初始化角色 ==========
    function initCharacters() {
        if (!window.Sakana) {
            console.error('[Sakana Widget] Sakana 未定义');
            return;
        }

        try {
            Sakana.init({
                el: '.chisato-box',
                character: 'chisato',
                scale: CONFIG.scale
            });

            Sakana.init({
                el: '.takina-box',
                character: 'takina',
                scale: CONFIG.scale
            });

            console.log('[Nezha UI] ✓ Sakana 石蒜模拟器已加载');
        } catch (e) {
            console.error('[Sakana Widget] 初始化失败:', e);
        }
    }

    // ========== 启动 ==========
    waitForBody(init);

})();
