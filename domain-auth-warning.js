/**
 * 域名授权检测脚本 - 防止未授权嵌入
 * v1.1 修复版
 * 
 * 创建日期: 2025-12-21
 * 更新日期: 2025-12-26
 * 
 * 功能: 检测页面是否在授权域名上运行，非授权域名显示警告
 */

(function () {
  'use strict';

  // ========== 配置项 ==========
  const CONFIG = {
    // 允许的域名列表 (支持完整域名和通配符)
    allowedDomains: [
      'localhost',
      '127.0.0.1',
      'vps.thesecondbrain.de',
      'vps.zacharylabs.com',
      // 添加更多允许的域名...
    ],

    // 是否启用域名检查
    enableCheck: true,

    // 警告框样式
    warning: {
      title: '⚠️ 未授权访问提示',
      message: '检测到此页面未在授权域名上运行。<br>如需正常访问，请访问官方网站。',
      buttonText: '我知道了',
      officialUrl: 'https://vps.thesecondbrain.de', // 官方网站地址
      linkText: '前往官方网站'
    },

    // 视觉效果配置
    effects: {
      enableBlink: true,      // 是否启用闪烁效果
      enableShake: false,     // 是否启用抖动效果
      blinkSpeed: 3,          // 闪烁速度(秒)
      shakeIntensity: 5       // 抖动强度(像素)
    }
  };

  // ========== 域名检查函数 ==========
  function checkDomain() {
    if (!CONFIG.enableCheck) return true;

    const currentDomain = window.location.hostname.toLowerCase();

    // 检查是否在允许列表中
    return CONFIG.allowedDomains.some(domain => {
      domain = domain.toLowerCase();

      // 精确匹配
      if (currentDomain === domain) return true;

      // 子域名匹配 (例如 *.example.com)
      if (currentDomain.endsWith('.' + domain)) return true;

      return false;
    });
  }

  // ========== 生成唯一ID ==========
  function generateId(prefix = 'auth-warning') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== 创建CSS样式 ==========
  function createStyles(warningId) {
    const blinkAnimation = CONFIG.effects.enableBlink ? `
    @keyframes gentle-blink {
      0 %, 100 % { opacity: 1; }
        50% {opacity: 0.7; }
      }
    ` : '';

    const shakeAnimation = CONFIG.effects.enableShake ? `
    @keyframes gentle-shake {
      0 %, 100 % { transform: translateX(0); }
        25% {transform: translateX(-${CONFIG.effects.shakeIntensity}px); }
    75% {transform: translateX(${CONFIG.effects.shakeIntensity}px); }
      }
    ` : '';

    const animations = [];
    if (CONFIG.effects.enableBlink) {
      animations.push(`gentle-blink ${CONFIG.effects.blinkSpeed}s ease-in-out infinite`);
    }
    if (CONFIG.effects.enableShake) {
      animations.push(`gentle-shake 0.5s ease-in-out infinite`);
    }
    const animationStyle = animations.length > 0 ? `animation: ${animations.join(', ')};` : '';

    return `
    ${blinkAnimation}
    ${shakeAnimation}

    #${warningId} {
      position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2147483647;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

    #${warningId} .warning-container {
      max-width: 500px;
    width: 90%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 30px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    text-align: center;
    color: white;
    ${animationStyle}
      }

    #${warningId} .warning-title {
      font-size: 28px;
    font-weight: 700;
    margin: 0 0 20px 0;
    line-height: 1.3;
      }

    #${warningId} .warning-message {
      font-size: 16px;
    line-height: 1.6;
    margin: 0 0 30px 0;
    opacity: 0.95;
      }

    #${warningId} .warning-actions {
      display: flex;
    flex-direction: column;
    gap: 12px;
      }

    #${warningId} .warning-button {
      padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
      }

    #${warningId} .warning-button.primary {
      background: white;
    color: #667eea;
      }

    #${warningId} .warning-button.primary:hover {
      background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
      }

    #${warningId} .warning-button.secondary {
      background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
      }

    #${warningId} .warning-button.secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
      }

    #${warningId} .warning-info {
      margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 13px;
    opacity: 0.7;
      }

    @media (max-width: 500px) {
      #${warningId} .warning-container {
      padding: 30px 20px;
        }

    #${warningId} .warning-title {
      font-size: 22px;
        }

    #${warningId} .warning-message {
      font-size: 14px;
        }

    #${warningId} .warning-button {
      padding: 12px 24px;
    font-size: 15px;
        }
      }
    `;
  }

  // ========== 创建警告框HTML ==========
  function createWarningHTML(warningId) {
    const currentDomain = window.location.hostname;

    return `
    <div class="warning-container">
      <div class="warning-title">${CONFIG.warning.title}</div>
      <div class="warning-message">${CONFIG.warning.message}</div>
      <div class="warning-actions">
        <a href="${CONFIG.warning.officialUrl}"
          class="warning-button primary"
          target="_blank"
          rel="noopener noreferrer">
          ${CONFIG.warning.linkText}
        </a>
        <button class="warning-button secondary"
          id="${warningId}-close">
          ${CONFIG.warning.buttonText}
        </button>
      </div>
      <div class="warning-info">
        当前域名: <code>${currentDomain}</code>
      </div>
    </div>
    `;
  }

  // ========== 显示警告框 ==========
  function showWarning() {
    const warningId = generateId();

    // 防止重复创建
    if (document.getElementById(warningId)) return;

    // 创建样式
    const styleElement = document.createElement('style');
    styleElement.id = `${warningId}-style`;
    styleElement.textContent = createStyles(warningId);
    document.head.appendChild(styleElement);

    // 创建警告框
    const warningElement = document.createElement('div');
    warningElement.id = warningId;
    warningElement.setAttribute('role', 'dialog');
    warningElement.setAttribute('aria-modal', 'true');
    warningElement.setAttribute('aria-labelledby', `${warningId}-title`);
    warningElement.innerHTML = createWarningHTML(warningId);

    // 添加到页面
    (document.body || document.documentElement).appendChild(warningElement);

    // 绑定关闭按钮事件
    const closeButton = document.getElementById(`${warningId}-close`);
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        warningElement.style.opacity = '0';
        warningElement.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          warningElement.remove();
          styleElement.remove();
        }, 300);
      });
    }

    console.warn('域名授权检测: 当前域名未授权');
  }

  // ========== 初始化 ==========
  function init() {
    // 检查域名
    const isAuthorized = checkDomain();

    if (!isAuthorized) {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showWarning, { once: true });
      } else {
        showWarning();
      }
    } else {
      console.log('域名授权检测: 已授权');
    }
  }

  // 立即执行
  init();

  // ========== 提供调试接口 ==========
  window.checkDomainAuth = function () {
    const isAuthorized = checkDomain();
    console.log('域名检查结果:', isAuthorized);
    console.log('当前域名:', window.location.hostname);
    console.log('允许的域名:', CONFIG.allowedDomains);
    return isAuthorized;
  };

  // 提供强制显示警告的接口(用于测试)
  window.testAuthWarning = function () {
    showWarning();
  };

})();