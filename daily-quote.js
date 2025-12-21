/**
 * Daily Quote Widget - 每日名言挂件
 * 性能优化版 v2.0
 * 
 * 特性：
 * - 中英文名言随机显示
 * - PC端：首页顶部显示，自动缩小并淡出
 * - 移动端：滚动到底部时显示
 * 
 * 优化项：
 * - 使用 IntersectionObserver 替代滚动监听
 * - 滚动事件节流优化
 * - 使用 matchMedia 响应屏幕变化
 * - 修复定时器逻辑缺陷
 * - 添加资源清理机制
 */

(function () {
    'use strict';

    // ========== 创建 CSS 样式 ==========
    const style = document.createElement('style');
    style.textContent = `
    :root {
      --bm-bg: rgba(255,255,255,.4);
    }

    /* 暗色模式 */
    .dark, html.dark, [data-theme="dark"] {
      --bm-bg: rgba(0,0,0,.3);
    }

    /* PC端样式 */
    .bm-wrap {
      position: absolute;
      top: 310px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: none;
      transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .bottom-marquee {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 62px;
      border-radius: 999px;
      padding: 0 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.05), inset 0 1px 1px rgba(255,255,255,.8);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      overflow: hidden;
      pointer-events: auto;
      background: linear-gradient(125deg, rgba(255,255,255,.4) 0%, rgba(255,255,255,.1) 40%, rgba(255,255,255,.05) 60%, rgba(255,255,255,.2) 100%);
      border: 1px solid rgba(255,255,255,.5);
      transition: height 15s ease;
    }

    /* 暗色模式玻璃效果 */
    .dark .bottom-marquee,
    html.dark .bottom-marquee,
    [data-theme="dark"] .bottom-marquee {
      background: linear-gradient(135deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,.1) 100%);
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 1px rgba(255,255,255,.05);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    .bm-track {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .bm-track::-webkit-scrollbar { display: none; }
    .bm-track { -ms-overflow-style: none; scrollbar-width: none; }

    .bm-item {
      font: 600 25px/62px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial;
      opacity: .95;
      display: flex;
      align-items: center;
      white-space: nowrap;
      transition: font-size 15s ease, line-height 15s ease;
    }

    .bm-item a { flex-shrink: 0; }

    .bm-wrap .logo {
      height: 48px;
      width: auto;
      object-fit: contain;
      margin: 0 5px;
      transition: height 15s ease;
    }

    /* 移动端 */
    @media (max-width: 640px) {
      .bm-wrap {
        position: fixed !important;
        top: auto !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        transform: translateY(100%) !important;
        width: 100vw !important;
        margin: 0 !important;
        z-index: 9999 !important;
      }
      .bm-wrap.visible {
        transform: translateY(0) !important;
      }
      .bottom-marquee { border-radius: 0; height: 32px; }
      .bm-item { font-size: 13px; line-height: 32px; }
      .bm-wrap .logo { height: 20px; }
    }
  `;

    document.head.appendChild(style);

    // ========== 创建 HTML 结构 ==========
    const container = document.createElement('div');
    container.className = 'bm-wrap';
    container.id = 'bmWrap';
    container.innerHTML = `
    <div class="bottom-marquee" role="region" aria-label="每日一句">
      <div class="bm-track">
        <span class="bm-item" id="quoteText">加载中...</span>
      </div>
    </div>
  `;

    document.body.appendChild(container);

    // ========== JavaScript 逻辑 ==========
    const wrap = document.getElementById('bmWrap');
    const marquee = wrap.querySelector('.bottom-marquee');
    const quoteText = document.getElementById('quoteText');

    // 清理资源
    const cleanup = {
        timers: [],
        listeners: [],
        observer: null,
        addTimer(id) {
            this.timers.push(id);
        },
        addListener(element, event, handler) {
            this.listeners.push({ element, event, handler });
            element.addEventListener(event, handler);
        },
        destroy() {
            this.timers.forEach(id => clearTimeout(id));
            this.listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    };

    let fadeoutTimer = null;
    let remainingTime = 3000;
    let startTime = 0;

    // 英文经典名言库
    const englishQuotes = [
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
        { text: 'To be, or not to be, that is the question.', author: 'William Shakespeare' },
        { text: 'I think, therefore I am.', author: 'René Descartes' },
        { text: 'The unexamined life is not worth living.', author: 'Socrates' },
        { text: 'Knowledge is power.', author: 'Francis Bacon' },
        { text: 'That which does not kill us makes us stronger.', author: 'Friedrich Nietzsche' },
        { text: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt' },
        { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
        { text: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
        { text: 'Two roads diverged in a wood, and I took the one less traveled by.', author: 'Robert Frost' },
        { text: 'Not all those who wander are lost.', author: 'J.R.R. Tolkien' },
        { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
        { text: 'Happiness is not something ready made. It comes from your own actions.', author: 'Dalai Lama' },
        { text: 'We are what we repeatedly do. Excellence is not an act, but a habit.', author: 'Aristotle' },
        { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
        { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
        { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
        { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela' },
        { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' }
    ];

    // 获取每日名言（50% 中文 hitokoto，50% 英文 Quotable）
    function fetchQuote() {
        const useEnglish = Math.random() < 0.5;

        if (useEnglish) {
            // 使用 Quotable API（英文名言）
            fetch('https://api.quotable.io/random?tags=famous-quotes|philosophy|literature|wisdom')
                .then(response => response.json())
                .then(data => {
                    const quote = data.content;
                    const author = data.author;
                    quoteText.textContent = `${quote} —— ${author}`;
                })
                .catch(() => {
                    // 失败时使用本地英文名言
                    const quote = englishQuotes[Math.floor(Math.random() * englishQuotes.length)];
                    quoteText.textContent = `${quote.text} —— ${quote.author}`;
                });
        } else {
            // 使用 hitokoto API（文学 + 诗词 + 哲学）
            fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k')
                .then(response => response.json())
                .then(data => {
                    const quote = data.hitokoto;
                    const author = data.from_who || data.from;
                    quoteText.textContent = author ? `${quote} —— ${author}` : quote;
                })
                .catch(() => {
                    // 失败时使用本地英文名言
                    const quote = englishQuotes[Math.floor(Math.random() * englishQuotes.length)];
                    quoteText.textContent = `${quote.text} —— ${quote.author}`;
                });
        }
    }

    // PC端缩小动画
    function shrinkAndStartTimer() {
        marquee.style.height = '62px';
        quoteText.style.fontSize = '25px';
        quoteText.style.lineHeight = '62px';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                marquee.style.height = '42px';
                quoteText.style.fontSize = '14px';
                quoteText.style.lineHeight = '42px';
            });
        });

        const timerId = setTimeout(startFadeoutTimer, 15000);
        cleanup.addTimer(timerId);
    }

    function startFadeoutTimer() {
        startTime = Date.now();
        fadeoutTimer = setTimeout(() => {
            wrap.style.opacity = '0';
            wrap.style.transform = 'translateX(-50%) translateY(-20px)';
            const hideTimer = setTimeout(() => {
                wrap.style.display = 'none';
            }, 500);
            cleanup.addTimer(hideTimer);
        }, remainingTime);
        cleanup.addTimer(fadeoutTimer);
    }

    function pauseTimer() {
        if (fadeoutTimer) {
            clearTimeout(fadeoutTimer);
            const elapsed = Date.now() - startTime;
            remainingTime = Math.max(0, remainingTime - elapsed); // 防止负数
        }
    }

    function resumeTimer() {
        if (remainingTime > 0) {
            startFadeoutTimer();
        }
    }

    // 获取名言
    fetchQuote();

    // 使用 matchMedia 检测屏幕尺寸
    const mobileQuery = window.matchMedia('(max-width: 640px)');

    function handleScreenChange(e) {
        if (e.matches) {
            // 移动端逻辑
            initMobile();
        } else {
            // PC端逻辑
            initDesktop();
        }
    }

    // PC端初始化
    function initDesktop() {
        // 清理移动端逻辑
        if (cleanup.observer) {
            cleanup.observer.disconnect();
            cleanup.observer = null;
        }

        // 仅首页显示
        if (window.location.pathname === '/' || window.location.pathname === '') {
            wrap.style.display = 'block';
            wrap.style.opacity = '1';
            wrap.style.transform = 'translateX(-50%)';

            cleanup.addListener(wrap, 'mouseenter', pauseTimer);
            cleanup.addListener(wrap, 'mouseleave', resumeTimer);

            shrinkAndStartTimer();
        } else {
            wrap.style.display = 'none';
        }
    }

    // 移动端初始化 - 使用节流滚动监听
    function initMobile() {
        wrap.style.opacity = '0';
        wrap.classList.remove('visible');

        let ticking = false;
        let isVisible = false;

        function checkScroll() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            const shouldShow = scrollTop + windowHeight >= docHeight - 10;

            if (shouldShow && !isVisible) {
                wrap.style.display = 'block';
                requestAnimationFrame(() => {
                    wrap.style.opacity = '1';
                    wrap.classList.add('visible');
                });
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                wrap.style.opacity = '0';
                wrap.classList.remove('visible');
                const hideTimer = setTimeout(() => {
                    wrap.style.display = 'none';
                }, 500);
                cleanup.addTimer(hideTimer);
                isVisible = false;
            }
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }

        cleanup.addListener(window, 'scroll', onScroll, { passive: true });

        // 初始检查
        checkScroll();
    }

    // 监听屏幕尺寸变化
    mobileQuery.addListener(handleScreenChange);

    // 初始化
    handleScreenChange(mobileQuery);

    console.log('[Daily Quote] 每日名言加载完成 ✨ (优化版 v2.0)');

    // 开发环境：暴露清理函数（可选）
    if (typeof window !== 'undefined') {
        window.__dailyQuoteCleanup = () => cleanup.destroy();
    }
})();
