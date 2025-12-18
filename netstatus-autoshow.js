/**
 * ============================================================
 * 🌐 网络状态自动显示模块
 * ============================================================
 * 作者: Zachary
 * GitHub: https://github.com/ZacharyLauGitHub
 * 创建时间: 2025-12-19
 * ============================================================
 * 
 * 功能:
 * - 隐藏切换按钮区域
 * - 自动点击按钮触发加载
 * - 强制同时显示两种视图 (列表 + 卡片)
 * 
 * 使用方法:
 * <script src="https://cdn.jsdelivr.net/gh/ZacharyLauGitHub/nezha-ui@main/netstatus-autoshow.js"></script>
 * 
 * ============================================================
 */

// ========== 选择器配置 ==========
// 切换按钮选择器
const selectorButton = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section > div.flex.justify-center.w-full.max-w-\\[200px\\] > div > div > div.relative.cursor-pointer.rounded-3xl.px-2\\.5.py-\\[8px\\].text-\\[13px\\].font-\\[600\\].transition-all.duration-500.text-stone-400.dark\\:text-stone-500';

// 切换区域选择器（需要隐藏的部分）
const selectorSection = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section';

// div3 选择器（第一个视图区域）
const selector3 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(3)';

// div4 选择器（第二个视图区域）
const selector4 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(4)';

// ========== 状态变量 ==========
let hasClicked = false;   // 是否已点击过按钮
let divVisible = false;   // 当前 div 是否可见

// ========== 强制显示两个 div ==========
// 确保 div3 和 div4 同时显示
function forceBothVisible() {
    const div3 = document.querySelector(selector3);
    const div4 = document.querySelector(selector4);
    if (div3 && div4) {
        div3.style.display = 'block';
        div4.style.display = 'block';
    }
}

// ========== 隐藏切换区域 ==========
// 隐藏切换按钮，防止用户手动切换
function hideSection() {
    const section = document.querySelector(selectorSection);
    if (section) {
        section.style.display = 'none';
    }
}

// ========== 尝试点击按钮 ==========
// 自动点击切换按钮，触发加载另一个视图
function tryClickButton() {
    const btn = document.querySelector(selectorButton);
    if (btn && !hasClicked) {
        btn.click();                       // 触发点击
        hasClicked = true;                 // 标记已点击
        setTimeout(forceBothVisible, 500); // 500ms 后强制显示
    }
}

// ========== DOM 变化监听器 ==========
// 监听 DOM 变化，自动执行显示逻辑
const observer = new MutationObserver(() => {
    const div3 = document.querySelector(selector3);
    const div4 = document.querySelector(selector4);

    // 检查 div 是否可见
    const isDiv3Visible = div3 && getComputedStyle(div3).display !== 'none';
    const isDiv4Visible = div4 && getComputedStyle(div4).display !== 'none';
    const isAnyDivVisible = isDiv3Visible || isDiv4Visible;

    // 首次检测到 div 可见时
    if (isAnyDivVisible && !divVisible) {
        hideSection();      // 隐藏切换按钮
        tryClickButton();   // 尝试点击
    }
    // 如果 div 变为不可见（路由切换等）
    else if (!isAnyDivVisible && divVisible) {
        hasClicked = false; // 重置点击状态
    }

    divVisible = isAnyDivVisible;

    // 确保两个 div 都可见
    if (div3 && div4) {
        if (!isDiv3Visible || !isDiv4Visible) {
            forceBothVisible();
        }
    }
});

// ========== 启动监听器 ==========
function startObserver() {
    const root = document.querySelector('#root');
    if (root) {
        observer.observe(root, {
            childList: true,              // 监听子节点变化
            attributes: true,             // 监听属性变化
            subtree: true,                // 监听所有后代节点
            attributeFilter: ['style', 'class']  // 只监听 style 和 class
        });
    }
}

// ========== DOM 就绪检查 ==========
// 确保 DOM 加载完成后再启动监听
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
} else {
    startObserver();
}
