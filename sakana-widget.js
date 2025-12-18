/**
 * ============================================================
 * 🐟 Sakana 石蒜模拟器
 * ============================================================
 * 作者: Zachary
 * GitHub: https://github.com/ZacharyLauGitHub
 * 创建时间: 2025-12-19
 * ============================================================
 * 
 * 功能: 在页面左下角和右下角添加可互动的动画角色
 * 
 * 使用方法:
 * <script src="https://cdn.jsdelivr.net/gh/ZacharyLauGitHub/nezha-ui@main/sakana-widget.js"></script>
 * 
 * ============================================================
 */

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
    // 初始化千束 (右下角)
    Sakana.init({
        el: '.chisato-box',
        character: 'chisato',
        scale: 0.5
    });

    // 初始化泷奈 (左下角)
    Sakana.init({
        el: '.takina-box',
        character: 'takina',
        scale: 0.5
    });

    console.log('[Nezha UI] ✓ Sakana 石蒜模拟器已加载');
};
document.head.appendChild(sakanaScript);
