/**
 * Star Trail - 鼠标星星拖尾特效
 * 
 * 功能：
 * - 鼠标移动时产生星星粒子拖尾效果
 * - 自动适配窗口大小
 * - 触屏设备自动禁用
 * 
 * 性能优化：
 * - 缓存DOM引用
 * - 限制最大粒子数
 * - 合并循环遍历
 * - 页面不可见时暂停动画
 * 
 * CDN: https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/star-trail.js
 */
(function fairyDustCursor() {
    'use strict';

    // ==================== 配置区 ====================
    const CONFIG = {
        colors: ["#D61C59", "#E7D84B", "#1B8798"],  // 星星颜色
        character: "*",                              // 星星字符
        fontSize: 25,                                // 字体大小
        lifeSpan: 120,                               // 粒子生命周期(帧数)
        maxParticles: 100,                           // 最大粒子数限制
        zIndex: 10000000                             // 层级
    };

    // ==================== 状态管理 ====================
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cursor = { x: width / 2, y: height / 2 };
    let particles = [];
    let container = null;
    let animationId = null;
    let isRunning = false;

    // ==================== 初始化 ====================
    function init() {
        // 创建并缓存容器
        container = document.createElement('div');
        container.className = 'js-cursor-container';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:' + CONFIG.zIndex;
        document.body.appendChild(container);

        bindEvents();
        start();
    }

    // ==================== 事件绑定 ====================
    function bindEvents() {
        document.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', onWindowResize, { passive: true });

        // 页面可见性变化时暂停/恢复动画
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        });
    }

    function onWindowResize() {
        width = window.innerWidth;
        height = window.innerHeight;
    }

    function onMouseMove(e) {
        cursor.x = e.clientX;
        cursor.y = e.clientY;

        // 限制最大粒子数，避免性能问题
        if (particles.length < CONFIG.maxParticles) {
            addParticle(cursor.x, cursor.y);
        }
    }

    // ==================== 粒子管理 ====================
    function addParticle(x, y) {
        const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        const particle = new Particle(x, y, color);
        particles.push(particle);
    }

    function updateParticles() {
        // 单次循环：更新和移除
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();

            if (p.lifeSpan < 0) {
                p.die();
                particles.splice(i, 1);
            }
        }
    }

    // ==================== 动画控制 ====================
    function loop() {
        updateParticles();
        animationId = requestAnimationFrame(loop);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        loop();
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // ==================== 粒子类 ====================
    function Particle(x, y, color) {
        this.lifeSpan = CONFIG.lifeSpan;
        this.initialLifeSpan = CONFIG.lifeSpan;

        this.velocity = {
            x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 2),
            y: 1
        };

        this.position = { x: x + 10, y: y + 10 };

        // 创建元素
        this.element = document.createElement('span');
        this.element.innerHTML = CONFIG.character;
        this.element.style.cssText =
            'position:fixed;display:inline-block;top:0;left:0;' +
            'pointer-events:none;touch-action:none;' +
            'font-size:' + CONFIG.fontSize + 'px;' +
            'color:' + color + ';' +
            'will-change:transform;';

        this.update();
        container.appendChild(this.element);
    }

    Particle.prototype.update = function () {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.lifeSpan--;

        const scale = this.lifeSpan / this.initialLifeSpan;
        this.element.style.transform =
            'translate3d(' + this.position.x + 'px,' + this.position.y + 'px,0) scale(' + scale + ')';
    };

    Particle.prototype.die = function () {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    };

    // ==================== 启动 ====================
    // 仅在非触屏设备上启动
    if (!('ontouchstart' in window || navigator.msMaxTouchPoints)) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

})();
