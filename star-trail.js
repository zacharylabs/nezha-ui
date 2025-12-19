/*!
 * 小星星拖尾特效 - Canvas 优化版
 * 作者: Zachary
 * GitHub: https://github.com/zacharylabs/nezha-ui
 * 功能: 鼠标移动时产生星星拖尾效果
 * 优化: Canvas 渲染、节流控制、可见性检测
 */
(function (window, document) {
    'use strict';

    // 配置
    const CONFIG = {
        colors: ['#D61C59', '#E7D84B', '#1B8798', '#FF6B6B', '#4ECDC4'],
        maxParticles: 50,       // 最大粒子数
        particleLife: 60,       // 粒子生命周期（帧数）
        spawnRate: 3,           // 每次移动生成粒子数
        particleSize: 12,       // 星星大小
        gravity: 0.5,           // 重力
        zIndex: 9999
    };

    let canvas, ctx;
    let particles = [];
    let animationId = null;
    let mouseX = 0, mouseY = 0;
    let isVisible = true;

    // 粒子类
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = Math.random() * -1 - 0.5;
            this.life = CONFIG.particleLife;
            this.maxLife = CONFIG.particleLife;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += CONFIG.gravity * 0.05;
            this.rotation += this.rotationSpeed;
            this.life--;
        }

        draw(ctx) {
            const progress = this.life / this.maxLife;
            const size = CONFIG.particleSize * progress;
            const alpha = progress;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.font = `${size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦', 0, 0);
            ctx.restore();
        }

        isDead() {
            return this.life <= 0;
        }
    }

    function initCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'star-trail-canvas';
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

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function spawnParticles(x, y) {
        for (let i = 0; i < CONFIG.spawnRate; i++) {
            if (particles.length < CONFIG.maxParticles) {
                particles.push(new Particle(x, y));
            }
        }
    }

    function animate() {
        if (!isVisible) {
            animationId = null;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新和绘制粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw(ctx);
            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (animationId) return;
        isVisible = true;
        animate();
    }

    function stop() {
        isVisible = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        spawnParticles(mouseX, mouseY);
        if (!animationId && isVisible) {
            start();
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    }

    function init() {
        // 触屏设备不启用
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            console.log('[Nezha UI] 星星拖尾特效：触屏设备已跳过');
            return;
        }

        initCanvas();

        document.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', resizeCanvas, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);

        console.log('[Nezha UI] ✓ 星星拖尾特效加载完成');
    }

    // 导出控制接口
    window.StarTrailEffect = {
        start: start,
        stop: stop,
        toggle: function () {
            if (isVisible) {
                stop();
                if (canvas) canvas.style.display = 'none';
            } else {
                if (canvas) canvas.style.display = 'block';
                start();
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window, document);
