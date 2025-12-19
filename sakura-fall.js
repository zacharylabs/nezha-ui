/*!
 * 樱花飘落特效 - 优化版
 * 作者: Zachary
 * GitHub: https://github.com/zacharylabs/nezha-ui
 * 功能: 页面樱花飘落动画
 * 优化: 可见性检测、性能优化、bug修复、封装隔离
 */
(function (window, document) {
    'use strict';

    // 配置
    const CONFIG = {
        particleCount: 30,     // 樱花数量（原版50，优化为30）
        minSize: 0.5,          // 最小尺寸
        maxSize: 1.0,          // 最大尺寸
        fallSpeed: 1.5,        // 下落速度
        windSpeed: -1.5,       // 风速（负值向左）
        zIndex: 9998           // z-index
    };

    // 樱花图片（base64内联）
    const SAKURA_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5x7yHQAAADhklEQVRYhe2YS0hUURjHf3fuzOioo2ZpaVpZUREVLYKgRYsWQdCqaNOiB0G7NkG7aNMuKGhXtGlVi6BFD4haBEUFRUQQFVE9NEuz0kpznFGn6dw5LWbGeTh3Hs7cQf+rO+d85/+d7zvfdy5cYQlLSJFQpgf4X4K1FMuKxeKJYaYGlHQPmFGsD6EwQCOMPUJxDbgHNAF1wEngQiaOlEiCxRDaww8hxVfAZWAYaAHOAAck700ogqL0Y9G89L8EHsMwtBo4BNwH6oGjwFUpcgeqZT/LqoJFc94vAZ1AKVAPnAYuSVFXwxD0IaR7tC0dZRDLUdYlI4o9MFYF7EARuwH0JqPZHoJu4iFYDD3rVEYnxwKfgY4IorJA8AvRbwtmC/ADaAaOA9ekyCVoho0gihrXqkx6EWwH2oCdkudWQHUFXwGuAM+TETQqAn2B/yXIk6QzQBtwQYpUAg1AAbBOZb4cW/AnPiVa7n2xKNUKc+dMwBrB/CDaFLgphR0CfvmxfySwjoBM0D6xHFXxdGA/8hnZBxwGlsuQe5L7Ci7Sd+D7NMJuT7YCLACOAB+Bg1LkJqAKeJzCvheiLfF+PJ8tMH6XYE5B5T3gB7BVspwAdgGfI4h+J9bvW8B7oCHR8VSAH7HbUxXTVxW0EdiLYtIJoFDy3AGE4r2kJmX8PJ9kfBZL8BGwDdiMsk45JJnvAB1RRNNd8H1sRNUSz7RAbHwYaAXWAI+kyBrgDLAnGcGCFBQslpBvUexe4wCwFbglhd4FyqKu9wMd0WzrpAgYIz6b5ARHgWNS5E0UM7RcJh2IV2e7PdiJYjIHuAlsJzibeAx6JxhmB1AI7IqX52xJYBbBsShSNSjmXAfYn+r9eMfiVbM3WM/JQrIJrA+TqT68AYJxTGLv7xHMC5Jt+3GSjyeAHyhmPAUcw69FWYCyCj4CdiQy6Gc01gdUXlDJmSjYtTNeBsQy3oCd8cZFLYrJCcD+RPYlI3hPsl1DFGtcwL54Y5L1xM54PYDjsTwl45mAYJjMZDxRMB5Jydy0xkKy5U2WM1m+KJgoGGu/JAsmsjbZ9alIluP5MN7EZLnJ8pPZ70um/wewKVFOovsS5UyUP1X9fglJl5+oL0VOsvx0y0+1/5cyOTbR+om+ACaS5Ui0fjrLSLd/Inb7M/HSHlhE+YLLAJeBN0B9sD/wVjjCaeBEIoJLWMK/4C8xz5dhpYJd5AAAAABJRU5ErkJggg==';

    let canvas, ctx;
    let sakuraList = [];
    let animationId = null;
    let isVisible = true;
    let img = new Image();

    // 樱花类
    class Sakura {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.s = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
            this.r = Math.random() * Math.PI * 2;
            this.rotateSpeed = (Math.random() - 0.5) * 0.02;

            if (initial) {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
            } else {
                // 从顶部或右侧重新进入
                if (Math.random() > 0.4) {
                    this.x = Math.random() * window.innerWidth;
                    this.y = -40;
                } else {
                    this.x = window.innerWidth + 40;
                    this.y = Math.random() * window.innerHeight;
                }
            }

            this.speedX = CONFIG.windSpeed + (Math.random() - 0.5);
            this.speedY = CONFIG.fallSpeed + Math.random() * 0.7;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.r += this.rotateSpeed;

            // 超出边界时重置
            if (this.x < -40 || this.x > window.innerWidth + 40 ||
                this.y < -40 || this.y > window.innerHeight + 40) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.r);
            const size = 40 * this.s;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
    }

    // 初始化Canvas
    function initCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'sakura-canvas';
        canvas.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${CONFIG.zIndex};
        `;
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resizeCanvas();
    }

    // 调整Canvas尺寸
    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    // 创建樱花
    function createSakuras() {
        sakuraList = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            sakuraList.push(new Sakura());
        }
    }

    // 动画循环
    function animate() {
        if (!isVisible) {
            animationId = null;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const sakura of sakuraList) {
            sakura.update();
            sakura.draw(ctx);
        }

        animationId = requestAnimationFrame(animate);
    }

    // 开始动画
    function start() {
        if (animationId) return;
        isVisible = true;
        animate();
    }

    // 停止动画
    function stop() {
        isVisible = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // 切换显示
    function toggle() {
        if (isVisible) {
            stop();
            if (canvas) canvas.style.display = 'none';
        } else {
            if (canvas) canvas.style.display = 'block';
            start();
        }
    }

    // 销毁
    function destroy() {
        stop();
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
        canvas = null;
        ctx = null;
        sakuraList = [];
    }

    // 可见性检测（页面不可见时暂停，节省资源）
    function handleVisibilityChange() {
        if (document.hidden) {
            stop();
        } else if (canvas && canvas.style.display !== 'none') {
            start();
        }
    }

    // 初始化
    function init() {
        img.onload = function () {
            initCanvas();
            createSakuras();
            start();

            // 监听窗口大小变化
            window.addEventListener('resize', resizeCanvas, { passive: true });

            // 监听页面可见性变化
            document.addEventListener('visibilitychange', handleVisibilityChange);

            console.log('[Nezha UI] ✓ 樱花特效加载完成');
        };
        img.src = SAKURA_IMG;
    }

    // 暴露API（可选）
    window.SakuraEffect = {
        start: start,
        stop: stop,
        toggle: toggle,
        destroy: destroy
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
