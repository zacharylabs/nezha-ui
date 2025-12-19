/**
 * 樱花飘落特效 - 哪吒探针优化版
 * @author zacharylabs
 * @link https://github.com/zacharylabs/nezha-ui
 * @license MIT
 * 
 * 使用方法：
 * <script src="https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/sakura-fall.js"></script>
 * 
 * 控制 API：
 * SakuraEffect.start()  - 启动特效
 * SakuraEffect.stop()   - 停止特效
 * SakuraEffect.toggle() - 切换显示/隐藏
 */
(function() {
    'use strict';

    var config = {
        particleCount: 30,
        maxSize: 40,
        speedY: 1.5,
        speedX: 0.5,
        rotationSpeed: 0.03
    };

    var animationId = null;
    var isRunning = false;
    var canvas = null;
    var ctx = null;
    var sakuraList = null;
    var img = new Image();

    img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUgAAAEwCAYAAADVZeifAAAACXBIWXMAAACYAAAAmAGiyIKwAAAHG2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBSaWdodHM9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9yaWdodHMvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcFJpZ2h0czpNYXJrZWQ9IkZhbHNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NDFDMjQxQjY2MjA2ODExODA4M0QyMTYwMDM5NTU0NCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjM0NWM5ZWI4LTg0NzgtMWQ0Ny04ZGMyLTJkOTI4Y2FhNjFlZCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiMDM3ZmIwYi01NTkyLTFiNGQtYmNkZC05ZTg0YTEwMmIwYzYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTgtMDUtMDVUMTQ6NDk6MzcrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTA1LTA5VDE0OjUxOjI1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE4LTA1LTA5VDE0OjUxOjI1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MTI1ZWVhNy0xMmNkLTE2NDQtOGQwMy1hYzkxNmUwMWQ0NWMiIHN0UmVmOmRvY3VtZW50SUQ9InV1aWQ6RDIwNUFGNjZCRDlFNTExOUM5REMwMzg2RjlEQjFGNyIvPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDphYmM2MjMzLWE5Y2QtY2I0NC04NWJiLTNlODIyMTBiYjEyNiIgc3RFdnQ6d2hlbj0iMjAxOC0wNS0wOVQxNDo1MToyNSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiMDM3ZmIwYi01NTkyLTFiNGQtYmNkZC05ZTg0YTEwMmIwYzYiIHN0RXZ0OndoZW49IjIwMTgtMDUtMDlUMTQ6NTE6MjUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5cKkGgAACkHElEQVR4nO3dmSI8u2LIipLnMHosnc595jyxhjSg1oggn/EWO+SP8B34JhRyWCItk1at7886MBnBUqg8TnH5P/3/q8bwv2zA+TfZ7HtvKbY4ScCOxCU4EaYE04hxb0hOYgEATAJTsGYkP2IQQBocAkkAGMBQcdgA47HA3aeg0cQkhmOGRhEZAMoIpdDhiREQYzXJQBDSQwygFGLdwET2/3c2luLx9fXzjhKk4hs8QTmsd2OAiHkIR4ZmFKxNMRGI7C5xPxt3+Lv+0GvL47/r/fBgBCJpAcYPwVAICbsPsE/v0VSJl49if8+/C/IEMwCIQBcCQUBeBlOOFi4K5wanyGcgAiPEe5XSApInJsllCQkAVQNFStpTcUjoakxtNZqJIwtIx2XigpUyaG2xSdvP9/+aPy3zoORuorKVD7OCoZfLxAUgMhegrEBYf1p8x2pYdxUKITVEXIBhewFit21bG0D+HWoQDgJwiERgF422CFNgpsh5YypHPck4S7YEEcjQQhAsoRj/ixARHiBOVpAhsthNkCKPZwCvNvTB1Ugi7/dnpunr9mYJjoGGWLOooVUAcDbAWV6CleN9sxJwzOeE/lczgakQ4OkzCNhBuwOwo/n+M+u4Pwsbd4dQLciJefwvRCLDsgyWVP+SMxx0HgSCe8h7/037CwY7YY1cPeyQzwAxe3j9FeBKSwOf3p7Q7cuQ7d0oYCbPkifvDnqaLNvOhAE0c7p2ACEbTBwIjhCMYIJhAJggWICsMuQTnEdCB7m/7f6rv2XLb2781ITP6bdpSgcrgNhFhTqChnv9eGosILijKAnCIvlxQsQbwC5AeTfM4IkACdhHtHUlBTxjYSjEYMATxHGEQyQK5GFlZ3daOWsLxgyiphYAMVJIv9XsIC9xgHg4HIDFBzUxyM5QCUShxBYifDwYSXErlkCkmEkaAcEDFRERUKmCxA0ARMiINEHBIcT2JkapPgmVhShHRjZOQU5xExqPw43uNQCOqffp0iEAegDShe9Nz4DUcK6Aa9nmACLylT+ynXYlC4CbYWLGHoTJzFxj8rTfH8ZnE14pfqP4Ctke0EBoEG0gMJLcK3J2Lx9XIrFz2kjBIhSvpx9NgI6QPgRB/Qu6YNIo8kHTpYcU0IWcRw+NJ9HIoAjIAroTja/FhWeRIblUoGQHShSZV9J3A7bDSD/jil2xHQgiOTNJRoToISW9rYsi2tnMZZ7ieHwSINhSJyYyBc7N8J7hmkAS7IAhgFYRRxNGFww2SOEQm5/e2IVZ3AToYHiEMEfGWtJkIQGRJgfsIEuU1wAzKGUmEM0oHgwMYo3aWJuG4B3IidlNJlQnYFJ/JNMxvfXcUxqNw2AH8WV0vg6y1+T2Yjb8liz9N0rDd5l9S7TfSuT4n0H7TzT7DeQLYDsQe5Fad4g4f2o9zf4TlmH7MH2Hp+B3Xsx7dYRniEWa2nLyUyR7vQr4wnVEOaRtybQB55zoqZnGiLzMPeVcz5ymEUdklSJ/HxpS1CPtHafAohAScnLVMbZYOEVSfH7cmStCs9qBdh7kssGzVrUdtdwPRrn/Wa7sfNeutdKHuDSviQCrnmGnQogr/VrrMcVVSiKn6/V0ZMqIN7UA0jlf4Jb9T+RJqPT8BfgDKoGBCqetwmRe3Rk2dcdQ8EF4ph1mYjI99NZuJ1xZB3rNSNFBcYW9Y8jNUoEMDQqOzryeyCFLqi5yTPLFr2sDBUJs8K0Je4hzfm9reAi1dF4XVNfHdS4/lvUCIx/Uj7xXhvZKmX/wsHrFomM8yUwPqDf+CBEKdHXIMvvYQLCK4OoNjiqAW71oYvzH/d2NH27IrcVcxniunRh63Y2+M9062daBad/qWaMcbinBpB/bGD9/+/gK/9B";

    function Sakura(x, y, s, r, fn) {
        this.x = x;
        this.y = y;
        this.s = s;
        this.r = r;
        this.fn = fn;
    }

    Sakura.prototype.draw = function(cxt) {
        cxt.save();
        cxt.translate(this.x, this.y);
        cxt.rotate(this.r);
        cxt.drawImage(img, 0, 0, config.maxSize * this.s, config.maxSize * this.s);
        cxt.restore();
    };

    Sakura.prototype.update = function() {
        this.x = this.fn.x(this.x, this.y);
        this.y = this.fn.y(this.y, this.y);
        this.r = this.fn.r(this.r);
        if (this.x > window.innerWidth || this.x < -50 || this.y > window.innerHeight || this.y < -50) {
            this.r = getRandom('fnr');
            if (Math.random() > 0.4) {
                this.x = getRandom('x');
                this.y = -20;
                this.s = getRandom('s');
                this.r = getRandom('r');
            } else {
                this.x = window.innerWidth + 20;
                this.y = getRandom('y');
                this.s = getRandom('s');
                this.r = getRandom('r');
            }
        }
    };

    function SakuraList() { this.list = []; }
    SakuraList.prototype.push = function(sakura) { this.list.push(sakura); };
    SakuraList.prototype.update = function() {
        for (var i = 0, len = this.list.length; i < len; i++) this.list[i].update();
    };
    SakuraList.prototype.draw = function(cxt) {
        for (var i = 0, len = this.list.length; i < len; i++) this.list[i].draw(cxt);
    };

    function getRandom(option) {
        var ret, random;
        switch (option) {
            case 'x': ret = Math.random() * window.innerWidth; break;
            case 'y': ret = Math.random() * window.innerHeight; break;
            case 's': ret = 0.4 + Math.random() * 0.6; break;
            case 'r': ret = Math.random() * 6; break;
            case 'fnx':
                random = -config.speedX + Math.random() * config.speedX * 2;
                ret = function(x) { return x + random - 1.7; };
                break;
            case 'fny':
                random = config.speedY + Math.random() * 0.7;
                ret = function(x, y) { return y + random; };
                break;
            case 'fnr':
                random = Math.random() * config.rotationSpeed;
                ret = function(r) { return r + random; };
                break;
        }
        return ret;
    }

    function initCanvas() {
        canvas = document.createElement('canvas');
        canvas.id = 'canvas_sakura';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:999999;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    function initParticles() {
        sakuraList = new SakuraList();
        for (var i = 0; i < config.particleCount; i++) {
            sakuraList.push(new Sakura(getRandom('x'), getRandom('y'), getRandom('s'), getRandom('r'), {
                x: getRandom('fnx'), y: getRandom('fny'), r: getRandom('fnr')
            }));
        }
    }

    function animate() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sakuraList.update();
        sakuraList.draw(ctx);
        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (isRunning) return;
        if (!canvas) initCanvas();
        if (!sakuraList) initParticles();
        isRunning = true;
        canvas.style.display = 'block';
        animate();
    }

    function stop() {
        isRunning = false;
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        if (canvas) canvas.style.display = 'none';
    }

    var resizeTimer = null;
    window.addEventListener('resize', function() {
        if (resizeTimer) return;
        resizeTimer = setTimeout(function() {
            if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
            resizeTimer = null;
        }, 200);
    });

    document.addEventListener('visibilitychange', function() {
        document.hidden ? stop() : start();
    });

    window.SakuraEffect = { start: start, stop: stop, toggle: function() { isRunning ? stop() : start(); } };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { img.complete ? start() : img.onload = start; });
    } else {
        img.complete ? start() : img.onload = start;
    }
})();
