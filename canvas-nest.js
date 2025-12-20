/**
 * Canvas Nest - 蜘蛛网粒子动画效果
 * 性能优化版 - 适用于背景装饰
 * 包含主题自动适配功能
 * 
 * 配置说明:
 * - count: 粒子数量 (建议: 50-150)
 * - color: RGB颜色值 '255,255,255'
 * - opacity: 透明度 (0-1)
 * - zIndex: 层级 (建议: -1 或 1)
 * - maxDistance: 最大连线距离
 */

(function () {
    'use strict';

    // 仅在桌面设备运行,移动设备跳过以节省性能
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // 主题检测函数
    function isDarkTheme() {
        return document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // 默认配置
    const CONFIG = {
        count: 120,              // 粒子数量(增加密度)
        color: isDarkTheme() ? '255,255,255' : '0,0,0',  // 主题自适应颜色
        opacity: 0.7,            // 画布透明度(提高可见度)
        zIndex: 1,               // z-index层级
        maxDistance: 12000,      // 最大连线距离²(增加连接)
        mouseDistance: 20000,    // 鼠标影响距离²
        speed: 0.5               // 粒子速度系数
    };

    // 创建画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.id = 'canvas-nest';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${CONFIG.zIndex};
        opacity: ${CONFIG.opacity};
        pointer-events: none;
    `;

    // 插入到body最前面
    document.body.insertBefore(canvas, document.body.firstChild);

    let width, height, particles = [];
    const mouse = { x: null, y: null, max: CONFIG.mouseDistance };

    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() * 2 - 1) * CONFIG.speed;
            this.vy = (Math.random() * 2 - 1) * CONFIG.speed;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x > width || this.x < 0) this.vx *= -1;
            if (this.y > height || this.y < 0) this.vy *= -1;
        }

        draw() {
            ctx.fillRect(this.x - 0.5, this.y - 0.5, 1, 1);
        }
    }

    // 调整画布大小
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = canvas.width = window.innerWidth * dpr;
        height = canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        width = window.innerWidth;
        height = window.innerHeight;
    }

    // 初始化粒子
    function init() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(new Particle());
        }
    }

    // 连接粒子
    function connectParticles(p1, p2, distance) {
        const opacity = (p2.max - distance) / p2.max;
        ctx.beginPath();
        ctx.lineWidth = opacity / 2;
        ctx.strokeStyle = `rgba(${CONFIG.color}, ${opacity + 0.2})`;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            // 连接到其他粒子
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONFIG.maxDistance) {
                    other.max = CONFIG.maxDistance;
                    connectParticles(particle, other, distSq);
                }
            }

            // 连接到鼠标
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particle.x - mouse.x;
                const dy = particle.y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouse.max) {
                    if (distSq >= mouse.max / 2) {
                        particle.x -= 0.03 * dx;
                        particle.y -= 0.03 * dy;
                    }
                    connectParticles(particle, mouse, distSq);
                }
            }
        });

        requestAnimationFrame(animate);
    }

    // 鼠标事件
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // 窗口大小变化
    window.addEventListener('resize', () => {
        resize();
        init();
    });

    // 监听主题切换
    const themeObserver = new MutationObserver(() => {
        const newColor = isDarkTheme() ? '255,255,255' : '0,0,0';
        if (CONFIG.color !== newColor) {
            CONFIG.color = newColor;
            console.log('[Canvas Nest] 主题已切换,颜色更新为:', newColor);
        }
    });

    // 监听 html 元素的 class 和 data-theme 属性变化
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
    });

    // 启动
    resize();
    init();
    animate();

    // 暴露到全局(可选,用于动态调整)
    window.CanvasNest = {
        config: CONFIG,
        restart: () => {
            resize();
            init();
        },
        updateTheme: () => {
            CONFIG.color = isDarkTheme() ? '255,255,255' : '0,0,0';
        }
    };
})();