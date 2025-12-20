/**
 * 哪吒面板底部信息修改 - 极简版
 * 只修改文字，无动画，无图标
 */

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        leftText: '© 2025 ZacharyLabs',                   // 左侧文字
        rightText: 'Powered by NeZha',                     // 右侧文字
        rightLink: 'https://github.com/nezhahq/nezha'     // 右侧链接
    };

    // ==================== 修改底部信息 ====================
    function updateFooter() {
        // 修改左侧
        const leftFooter = document.querySelector('.server-footer-name > div:first-child');
        if (leftFooter) {
            leftFooter.textContent = CONFIG.leftText;
        }

        // 修改右侧 - 清空显示
        const rightFooter = document.querySelector('.server-footer-theme');
        if (rightFooter) {
            rightFooter.innerHTML = '';  // 清空右侧
        }

        console.log('✅ 底部信息已更新');
    }

    // ==================== 等待 DOM 加载 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(updateFooter, 500);
        });
    } else {
        setTimeout(updateFooter, 500);
    }

})();