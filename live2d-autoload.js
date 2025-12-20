/**
 * Live2D 看板娘 - 可自定义配置版本
 * 基于官方 autoload.js 修改，支持自定义配置
 * 
 * 使用方法：
 * <script src="https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/live2d-autoload.js"></script>
 */

(function () {
    'use strict';

    // ==================== 🎨 自定义配置区 ====================
    const CONFIG = {
        // Live2D 资源路径
        live2dPath: 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0-rc.6/dist/',

        // 设备检测
        device: {
            minScreenWidth: 768,        // 最小屏幕宽度（像素）
            blockMobile: true,          // 是否屏蔽移动设备
        },

        // 工具栏按钮（可自由增删）
        tools: [
            'hitokoto',        // 一言（随机句子）
            'asteroids',       // 小游戏
            'switch-model',    // 切换角色
            'switch-texture',  // 切换服装
            'photo',           // 截图
            'info',            // 信息
            'quit'             // 关闭
        ],

        // 高级选项
        options: {
            drag: false,              // 是否可拖拽
            logLevel: 'warn',         // 日志级别: 'off', 'error', 'warn', 'info', 'debug'
            crossOrigin: true,        // 解决图片跨域问题
        },

        // 引擎路径
        engines: {
            cubism2: 'live2d.min.js',  // Cubism 2.x 引擎（相对于 live2dPath）
            cubism5: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
        },

        // 可选：使用自定义模型 API
        // cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
    };

    // ==================== 资源加载函数 ====================
    function loadExternalResource(url, type) {
        return new Promise((resolve, reject) => {
            let tag;

            if (type === 'css') {
                tag = document.createElement('link');
                tag.rel = 'stylesheet';
                tag.href = url;
            } else if (type === 'js') {
                tag = document.createElement('script');
                tag.type = 'module';
                tag.src = url;
            }

            if (tag) {
                tag.onload = () => resolve(url);
                tag.onerror = () => reject(url);
                document.head.appendChild(tag);
            }
        });
    }

    // ==================== 设备检测 ====================
    function checkDevice() {
        const { minScreenWidth, blockMobile } = CONFIG.device;

        // 检查屏幕宽度
        if (screen.width < minScreenWidth) {
            console.log(`[Live2D] 屏幕宽度 ${screen.width}px < ${minScreenWidth}px，跳过加载`);
            return false;
        }

        // 检查是否为移动设备
        if (blockMobile && navigator.userAgent.match(/Mobile/i)) {
            console.log('[Live2D] 移动设备检测，跳过加载');
            return false;
        }

        return true;
    }

    // ==================== 初始化 Live2D ====================
    async function initLive2D() {
        const { live2dPath, tools, options, engines } = CONFIG;

        try {
            // 解决跨域问题
            if (options.crossOrigin) {
                const OriginalImage = window.Image;
                window.Image = function (...args) {
                    const img = new OriginalImage(...args);
                    img.crossOrigin = "anonymous";
                    return img;
                };
                window.Image.prototype = OriginalImage.prototype;
            }

            // 加载 CSS 和 JS
            await Promise.all([
                loadExternalResource(live2dPath + 'waifu.css', 'css'),
                loadExternalResource(live2dPath + 'waifu-tips.js', 'js')
            ]);

            // 配置选项
            const widgetConfig = {
                waifuPath: live2dPath + 'waifu-tips.json',
                cubism2Path: live2dPath + engines.cubism2,
                cubism5Path: engines.cubism5,
                tools: tools,
                logLevel: options.logLevel,
                drag: options.drag,
            };

            // 如果有自定义 CDN，添加到配置
            if (CONFIG.cdnPath) {
                widgetConfig.cdnPath = CONFIG.cdnPath;
            }

            // 确保 initWidget 已加载
            if (typeof initWidget === 'function') {
                initWidget(widgetConfig);
                console.log('%c Live2D Widget 已加载 ', 'background: #FF69B4; color: #fff; padding: 5px 10px; border-radius: 3px;');
            } else {
                console.error('[Live2D] initWidget 函数未定义');
            }

        } catch (err) {
            console.error('[Live2D] 加载失败:', err);
        }
    }

    // ==================== 主函数 ====================
    function init() {
        // 设备检测
        if (!checkDevice()) {
            return;
        }

        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLive2D);
        } else {
            initLive2D();
        }
    }

    // 启动
    init();

    // 控制台彩蛋
    console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
  `);

})();
