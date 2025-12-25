
/*!
 * 鼠标点击爱心特效 - 优化版
 * 作者: Zachary
 * GitHub: https://github.com/zacharylabs/nezha-ui
 * 功能: 点击页面任意位置生成彩色爱心动画
 * 特性: 节流控制、数量限制、按需动画、自动清理
 */
(function (window, document) {
    'use strict';

    const hearts = [];
    let animationId = null;
    let lastClickTime = 0;
    const THROTTLE_MS = 100;  // 点击节流: 100ms
    const MAX_HEARTS = 20;    // 最大同时存在数量

    // 添加样式
    function addStyles() {
        const style = document.createElement('style');
        style.id = 'click-heart-style';
        style.textContent = `
            .click-heart {
                width: 10px;
                height: 10px;
                position: fixed;
                background: #f00;
                transform: rotate(45deg);
                pointer-events: none;
                will-change: transform, opacity;
                z-index: 9999;
            }
            .click-heart:after,
            .click-heart:before {
                content: '';
                width: inherit;
                height: inherit;
                background: inherit;
                border-radius: 50%;
                position: absolute;
            }
            .click-heart:after { top: -5px; }
            .click-heart:before { left: -5px; }
        `;
        document.head.appendChild(style);
    }

    // 生成随机颜色
    function randomColor() {
        return `rgb(${~~(Math.random() * 255)}, ${~~(Math.random() * 255)}, ${~~(Math.random() * 255)})`;
    }

    // 创建爱心
    function createHeart(x, y) {
        const now = Date.now();

        // 节流控制
        if (now - lastClickTime < THROTTLE_MS) return;
        lastClickTime = now;

        // 限制最大数量
        if (hearts.length >= MAX_HEARTS) {
            const oldest = hearts.shift();
            if (oldest?.el?.parentNode) {
                oldest.el.parentNode.removeChild(oldest.el);
            }
        }

        const heart = document.createElement('div');
        heart.className = 'click-heart';
        heart.style.left = (x - 5) + 'px';
        heart.style.top = (y - 5) + 'px';
        heart.style.background = randomColor();

        hearts.push({
            el: heart,
            x: x - 5,
            y: y - 5,
            initialY: y - 5,  // 记录初始Y位置
            scale: 1,
            alpha: 1
        });

        document.body.appendChild(heart);

        // 开始动画
        if (!animationId) animate();
    }

    // 动画循环
    function animate() {
        let hasActive = false;

        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];

            if (h.alpha <= 0) {
                if (h.el?.parentNode) {
                    h.el.parentNode.removeChild(h.el);
                }
                hearts.splice(i, 1);
            } else {
                h.y -= 1;
                h.scale += 0.004;
                h.alpha -= 0.013;

                // 使用translate3d代替top，启用GPU加速
                const dy = h.y - h.initialY;
                h.el.style.transform = `translate3d(0, ${dy}px, 0) scale(${h.scale}) rotate(45deg)`;
                h.el.style.opacity = h.alpha;

                hasActive = true;
            }
        }

        animationId = hasActive ? requestAnimationFrame(animate) : null;
    }

    // 初始化
    function init() {
        addStyles();
        document.addEventListener('click', function (e) {
            createHeart(e.clientX, e.clientY);
        }, { passive: true });

        console.log('[Nezha UI] ✓ 爱心特效加载完成');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
