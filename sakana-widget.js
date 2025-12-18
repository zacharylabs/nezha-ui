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
    // 注入样式
    const sakanaStyle = document.createElement('style');
    sakanaStyle.textContent = `
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
    document.head.appendChild(sakanaStyle);

    // 主函数
    function initSakana() {
        // 创建容器
        const chisatoBox = document.createElement('div');
        chisatoBox.className = 'chisato-box';
        document.body.appendChild(chisatoBox);

        const takinaBox = document.createElement('div');
        takinaBox.className = 'takina-box';
        document.body.appendChild(takinaBox);

        // 加载 Sakana 库
        const sakanaScript = document.createElement('script');
        sakanaScript.src = 'https://cdn.jsdelivr.net/npm/sakana@1.0.8';
        sakanaScript.onload = function () {
            Sakana.init({ el: '.chisato-box', character: 'chisato', scale: 0.5 });
            Sakana.init({ el: '.takina-box', character: 'takina', scale: 0.5 });
            console.log('[Nezha UI] ✓ Sakana 石蒜模拟器已加载');
        };
        document.head.appendChild(sakanaScript);
    }

    // DOM 就绪检查
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSakana);
    } else {
        initSakana();
    }
})();
