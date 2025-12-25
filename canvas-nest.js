/**
 * Canvas Nest - 蜘蛛网粒子动画效果
 * 完美优化版 v3.1
 * - 修复事件监听器清理
 * - 优化字符串拼接性能
 * - 确保resize后状态正确
 * - 添加错误处理和边界检查
 */
(function () {
    'use strict';

    // 仅在桌面设备运行
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        console.log('[Canvas Nest] 检测到移动设备，跳过初始化');
        return;
    }

    // 主题检测
    function isDarkTheme() {
        return document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // 配置
    const CONFIG = {
        count: 150,              // 增加粒子数量
        color: isDarkTheme() ? '255,255,255' : '0,0,0',
        opacity: 0.9,            // 提高画布透明度
        zIndex: 1,
        maxDistance: 15000,      // 增加连线距离
        mouseDistance: 20000,
        speed: 0.5,
        enablePerformanceMonitor: false
    };

    // 预计算常量
    const SQRT_MAX_DISTANCE = Math.sqrt(CONFIG.maxDistance);
    const SQRT_MOUSE_DISTANCE = Math.sqrt(CONFIG.mouseDistance);
    const INV_SQRT_MAX_DISTANCE = 1 / SQRT_MAX_DISTANCE;
    const INV_SQRT_MOUSE_DISTANCE = 1 / SQRT_MOUSE_DISTANCE;

    // 颜色缓存
    let particleColor = `rgb(${CONFIG.color})`;
    const lineColorCache = new Map();
    const MAX_CACHE_SIZE = 50;  // 限制缓存大小

    function getLineColor(opacity) {
        const key = (opacity * 100) | 0;  // 整数key，更快
        if (!lineColorCache.has(key)) {
            // 限制缓存大小
            if (lineColorCache.size >= MAX_CACHE_SIZE) {
                const firstKey = lineColorCache.keys().next().value;
                lineColorCache.delete(firstKey);
            }
            // 优化：减少一次toFixed调用，提高透明度使连线更清晰
            const alpha = ((opacity * 50) | 0).toString().padStart(2, '0');
            lineColorCache.set(key, `rgba(${CONFIG.color},0.${alpha})`);
        }
        return lineColorCache.get(key);
    }

    // 创建画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false  // 性能提示
    });

    if (!ctx) {
        console.error('[Canvas Nest] Canvas context创建失败');
        return;
    }

    canvas.id = 'canvas-nest';
    canvas.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:${CONFIG.zIndex};opacity:${CONFIG.opacity};pointer-events:none`;
    document.body.insertBefore(canvas, document.body.firstChild);

    let width, height, particles = [];
    const mouse = { x: null, y: null };

    // 性能监控
    let frameCount = 0, lastFpsUpdate = performance.now(), currentFps = 60;

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

            // 边界检测
            if (this.x > width) { this.x = width; this.vx = -this.vx; }
            else if (this.x < 0) { this.x = 0; this.vx = -this.vx; }

            if (this.y > height) { this.y = height; this.vy = -this.vy; }
            else if (this.y < 0) { this.y = 0; this.vy = -this.vy; }
        }

        draw() {
            ctx.fillRect(this.x - 0.5, this.y - 0.5, 1, 1);
        }
    }

    // 调整画布
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    }

    // 初始化
    function init() {
        particles = [];
        for (let i = 0; i < CONFIG.count; i++) {
            particles.push(new Particle());
        }
        console.log(`[Canvas Nest] 已初始化 ${CONFIG.count} 个粒子`);
    }

    // 连接粒子
    function connectParticles(p1, p2, distSq, invSqrtMax) {
        // 优化：只需一次sqrt，避免重复计算
        const opacity = Math.max(0, 1 - Math.sqrt(distSq) * invSqrtMax);

        ctx.lineWidth = opacity * 0.8;  // 增加线宽使连线更明显
        ctx.strokeStyle = getLineColor(opacity);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // 动画循环
    function animate() {
        if (!isRunning) return;
        animationId = requestAnimationFrame(animate);

        // 性能监控
        if (CONFIG.enablePerformanceMonitor) {
            frameCount++;
            const now = performance.now();
            if (now - lastFpsUpdate >= 1000) {
                currentFps = frameCount;
                frameCount = 0;
                lastFpsUpdate = now;
                if (currentFps < 30) {
                    console.warn(`[Canvas Nest] FPS过低: ${currentFps}`);
                }
            }
        }

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = particleColor;

        const len = particles.length;
        const hasMouseInteraction = mouse.x !== null && mouse.y !== null;

        // 更新和绘制
        for (let i = 0; i < len; i++) {
            const p = particles[i];
            p.update();
            p.draw();

            // 粒子间连线
            for (let j = i + 1; j < len; j++) {
                const other = particles[j];
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONFIG.maxDistance) {
                    connectParticles(p, other, distSq, INV_SQRT_MAX_DISTANCE);
                }
            }

            // 鼠标交互
            if (hasMouseInteraction) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < CONFIG.mouseDistance) {
                    // 排斥效果
                    if (distSq >= CONFIG.mouseDistance / 2) {
                        const repelFactor = 0.03;
                        p.x -= repelFactor * dx;
                        p.y -= repelFactor * dy;
                    }
                    connectParticles(p, mouse, distSq, INV_SQRT_MOUSE_DISTANCE);
                }
            }
        }
    }

    // ===== 事件处理器（保存引用以便清理）=====
    const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
        mouse.x = null;
        mouse.y = null;
    };

    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            resize();
            init();
        }, 150);
    };

    const handleVisibilityChange = () => {
        document.hidden ? stopAnimation() : startAnimation();
    };

    // 事件监听
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 主题切换
    const themeObserver = new MutationObserver(() => {
        const newColor = isDarkTheme() ? '255,255,255' : '0,0,0';
        if (CONFIG.color !== newColor) {
            CONFIG.color = newColor;
            particleColor = `rgb(${CONFIG.color})`;
            lineColorCache.clear();
            console.log('[Canvas Nest] 主题已切换，颜色更新为:', newColor);
        }
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
    });

    // 页面可见性
    let animationId = null;
    let isRunning = false;

    function startAnimation() {
        if (!isRunning) {
            isRunning = true;
            animate();
            console.log('[Canvas Nest] 动画已启动');
        }
    }

    function stopAnimation() {
        if (isRunning) {
            isRunning = false;
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            console.log('[Canvas Nest] 动画已暂停');
        }
    }

    // 启动
    resize();
    init();
    startAnimation();

    console.log('[Canvas Nest] 初始化完成（v3.1完美版）');

    // API
    window.CanvasNest = {
        config: CONFIG,
        restart: () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            resize();
            init();
            console.log('[Canvas Nest] 已重启');
        },
        updateTheme: () => {
            const newColor = isDarkTheme() ? '255,255,255' : '0,0,0';
            CONFIG.color = newColor;
            particleColor = `rgb(${CONFIG.color})`;
            lineColorCache.clear();
            console.log('[Canvas Nest] 主题颜色已更新');
        },
        destroy: () => {
            stopAnimation();
            themeObserver.disconnect();

            // 清理所有事件监听器
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            canvas.remove();
            particles = [];
            lineColorCache.clear();
            delete window.CanvasNest;

            console.log('[Canvas Nest] 已完全销毁');
        },
        getFPS: () => currentFps,
        getParticleCount: () => particles.length
    };
})();