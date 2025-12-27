/*!
 * 樱花飘落特效 (极致优化版)
 * 作者: Zachary
 * GitHub: https://github.com/zacharylabs/nezha-ui
 * 功能: 页面樱花飘落动画
 * 优化: 移动端适配 + 对象池复用 + 性能提示
 */
(function () {
    'use strict';

    // 配置项
    var CONFIG = {
        DESKTOP_COUNT: 50,    // 桌面端樱花数量
        MOBILE_COUNT: 25,     // 移动端樱花数量
        SAKURA_SIZE: 40,      // 樱花基准大小
        Z_INDEX: 999999
    };

    // 状态变量
    var animationId = null;
    var isRunning = false;
    var isPaused = false;
    var canvas = null;
    var ctx = null;
    var sakuraPool = [];      // 对象池
    var activeSakuras = [];   // 活跃的樱花
    var img = new Image();
    var lastTime = 0;         // 上一帧时间戳（用于计算 deltaTime）

    // 缓存窗口尺寸（避免频繁读取）
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;

    // 检测移动设备
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    var sakuraCount = isMobile ? CONFIG.MOBILE_COUNT : CONFIG.DESKTOP_COUNT;

    img.src = "https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/sakura.png";

    // 樱花构造函数
    function Sakura() {
        this.reset();
    }

    Sakura.prototype.reset = function () {
        this.x = Math.random() * winWidth;
        this.y = Math.random() * winHeight;
        this.s = Math.random();
        this.r = Math.random() * 6;

        var randomX = -0.5 + Math.random();
        var randomY = 1.5 + Math.random() * 0.7;
        var randomR = Math.random() * 0.03;

        this.vx = 0.5 * randomX - 1.7;  // x 方向速度
        this.vy = randomY;               // y 方向速度
        this.vr = randomR;               // 旋转速度
    };

    Sakura.prototype.draw = function () {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.r);
        ctx.drawImage(img, 0, 0, CONFIG.SAKURA_SIZE * this.s, CONFIG.SAKURA_SIZE * this.s);
        ctx.restore();
    };

    Sakura.prototype.update = function (deltaTime) {
        // 基于 deltaTime 的移动，实现帧率无关动画
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.r += this.vr * deltaTime;

        // 超出边界时重置
        if (this.x > winWidth || this.x < 0 || this.y > winHeight || this.y < 0) {
            if (Math.random() > 0.4) {
                // 从顶部重新进入
                this.x = Math.random() * winWidth;
                this.y = 0;
            } else {
                // 从右侧重新进入
                this.x = winWidth;
                this.y = Math.random() * winHeight;
            }
            this.s = Math.random();
            this.r = Math.random() * 6;

            var randomX = -0.5 + Math.random();
            var randomY = 1.5 + Math.random() * 0.7;
            this.vx = 0.5 * randomX - 1.7;
            this.vy = randomY;
            this.vr = Math.random() * 0.03;
        }
    };

    // 从对象池获取樱花
    function getSakura() {
        return sakuraPool.length > 0 ? sakuraPool.pop() : new Sakura();
    }

    // 归还樱花到对象池
    function returnSakura(sakura) {
        sakuraPool.push(sakura);
    }

    // 动画循环（帧率无关）
    function animate(currentTime) {
        if (!isRunning || isPaused) return;

        // 计算 deltaTime，标准化为 60fps (16.67ms)
        // 首帧或恢复时使用标准间隔
        if (lastTime === 0) lastTime = currentTime;
        var deltaTime = (currentTime - lastTime) / 16.67;
        lastTime = currentTime;

        // 限制 deltaTime 范围，防止页面切换回来时跳帧过大
        if (deltaTime > 3) deltaTime = 1;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0, len = activeSakuras.length; i < len; i++) {
            activeSakuras[i].update(deltaTime);
            activeSakuras[i].draw();
        }

        animationId = requestAnimationFrame(animate);
    }

    // 启动樱花效果
    function startSakura() {
        if (isRunning) return;

        // 更新窗口尺寸缓存
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;

        canvas = document.createElement('canvas');
        canvas.width = winWidth;
        canvas.height = winHeight;
        canvas.id = 'canvas_sakura';
        canvas.style.cssText =
            'position:fixed;left:0;top:0;pointer-events:none;' +
            'z-index:' + CONFIG.Z_INDEX + ';' +
            'will-change:transform;';  // 性能提示
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');

        // 初始化樱花
        activeSakuras = [];
        for (var i = 0; i < sakuraCount; i++) {
            var sakura = getSakura();
            sakura.reset();
            activeSakuras.push(sakura);
        }

        isRunning = true;
        isPaused = false;
        lastTime = 0;  // 重置时间戳
        animationId = requestAnimationFrame(animate);
    }

    // 停止樱花效果
    function stopSakura() {
        if (!isRunning) return;

        isRunning = false;
        isPaused = false;

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // 归还所有樱花到对象池
        while (activeSakuras.length > 0) {
            returnSakura(activeSakuras.pop());
        }

        var canvasEl = document.getElementById('canvas_sakura');
        if (canvasEl && canvasEl.parentNode) {
            canvasEl.parentNode.removeChild(canvasEl);
        }

        canvas = null;
        ctx = null;
    }

    // 窗口缩放处理（带节流）
    var resizeTimer = null;
    window.addEventListener('resize', function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // 更新缓存的窗口尺寸
            winWidth = window.innerWidth;
            winHeight = window.innerHeight;

            var canvasEl = document.getElementById('canvas_sakura');
            if (canvasEl) {
                canvasEl.width = winWidth;
                canvasEl.height = winHeight;
            }
        }, 150);
    });

    // 页面可见性控制
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (isRunning) {
                isPaused = true;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        } else {
            if (isRunning && isPaused) {
                isPaused = false;
                lastTime = 0;  // 重置时间戳，防止恢复时跳帧
                animationId = requestAnimationFrame(animate);
            }
        }
    });

    // 图片加载处理
    img.onload = function () {
        startSakura();
    };

    img.onerror = function () {
        console.warn('[Sakura] 樱花图片加载失败:', img.src);
    };

    // 暴露 API
    window.toggleSakura = function () {
        isRunning ? stopSakura() : startSakura();
    };
    window.startSakura = startSakura;
    window.stopSakura = stopSakura;
})();
