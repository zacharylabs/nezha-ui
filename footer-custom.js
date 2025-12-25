/**
 * 哪吒面板底部信息修改 - 优化版
 * v2.0 - 修复配置未使用bug、添加重试机制、改进错误处理
 */

(function () {
    'use strict';

    // ==================== 配置 ====================
    const CONFIG = {
        leftText: '© 2025 ZacharyLabs',                   // 左侧文字
        rightText: 'Powered by NeZha',                     // 右侧文字
        rightLink: 'https://github.com/nezhahq/nezha',    // 右侧链接
        maxRetries: 3,                                     // 最大重试次数
        retryDelay: 200                                    // 重试延迟(ms)
    };

    // ==================== 修改底部信息 ====================
    function updateFooter() {
        const leftFooter = document.querySelector('.server-footer-name > div:first-child');
        const rightFooter = document.querySelector('.server-footer-theme');

        let updated = false;

        // 修改左侧
        if (leftFooter) {
            leftFooter.textContent = CONFIG.leftText;
            updated = true;
        }

        // 修改右侧 - 使用配置的链接和文字
        if (rightFooter) {
            const link = document.createElement('a');
            link.href = CONFIG.rightLink;
            link.textContent = CONFIG.rightText;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.cssText = 'color:inherit;text-decoration:none';

            // 悬停效果 - 使用内联事件避免重复监听
            link.onmouseenter = () => link.style.opacity = '0.7';
            link.onmouseleave = () => link.style.opacity = '1';

            rightFooter.innerHTML = '';
            rightFooter.appendChild(link);
            updated = true;
        }

        // 日志反馈
        if (updated) {
            console.log('✅ [Footer] 底部信息已更新');
            return true;
        } else {
            console.warn('⚠️ [Footer] 底部元素未找到');
            return false;
        }
    }

    // ==================== 重试机制 ====================
    let retryCount = 0;

    function tryUpdate() {
        // 检查关键元素是否存在
        const footerExists = document.querySelector('.server-footer-name');

        if (footerExists) {
            updateFooter();
        } else if (retryCount < CONFIG.maxRetries) {
            retryCount++;
            console.log(`⏳ [Footer] 重试 ${retryCount}/${CONFIG.maxRetries}...`);
            setTimeout(tryUpdate, CONFIG.retryDelay);
        } else {
            console.error('❌ [Footer] 更新失败：底部元素未找到（已重试3次）');
        }
    }

    // ==================== 初始化 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryUpdate);
    } else {
        tryUpdate();
    }

})();