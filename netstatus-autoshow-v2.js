// ==UserScript==
// @version      2.3
// @description  哪吒详情页直接展示网络波动卡片（网络延迟置顶 + 液态玻璃控件适配版）
// @author       Modified based on nodeseek post
// ==/UserScript==

(function () {
    'use strict';

    const INSTANCE_KEY = '__NetstatusAutoshowInstance__';
    const GLASS_CSS_ID = 'netstatus-autoshow-liquid-glass-css';
    const RANGE_STYLE_ID = 'netstatus-autoshow-range-liquid-style';
    const GLASS_CSS_URL = 'https://cdn.jsdelivr.net/gh/zacharylabs/nezha-ui@main/liquid-glass-dispersion.css';
    const ROOT_SELECTOR = '#root';
    const CONTAINER_SELECTOR = '.server-info';
    const TAB_SELECTOR = '.server-info-tab, .server-info section.flex.items-center.my-2.w-full';
    const DETAIL_ATTR = 'data-netstatus-autoshow-detail';
    const NETWORK_ATTR = 'data-netstatus-autoshow-network';
    const RANGE_ATTR = 'data-netstatus-autoshow-range';
    const RANGE_ITEM_ATTR = 'data-netstatus-autoshow-range-item';
    const RANGE_ACTIVE_ATTR = 'data-netstatus-autoshow-range-active';
    const PEAK_GROUP_ATTR = 'data-netstatus-autoshow-peak-group';
    const OBSERVER_DEBOUNCE_MS = 80;
    const START_RETRY_MS = 250;
    const START_RETRY_LIMIT = 80;
    const RECOVERY_INTERVAL_MS = 10000;
    const RANGE_BAR_OFFSET_Y = '8px';
    const PEAK_RETRY_LIMIT = 15;
    const DEBUG = false;

    if (window[INSTANCE_KEY] && typeof window[INSTANCE_KEY].stop === 'function') {
        window[INSTANCE_KEY].stop();
    }

    let hasClickedNetwork = false;
    let hasClickedPeak = false;
    let lastUrl = location.href;
    let observer = null;
    let debounceTimer = null;
    let recoveryTimer = null;
    let startRetryTimer = null;
    let startRetryCount = 0;
    let missingNetworkCount = 0;

    function log(message) {
        if (DEBUG) {
            console.log('[NetstatusAutoshow]', message);
        }
    }

    function setImportantDisplay(node, value) {
        if (node) {
            node.style.setProperty('display', value, 'important');
        }
    }

    function injectExternalGlassStylesheet() {
        if (!document.head) return;
        if (document.getElementById(GLASS_CSS_ID)) return;
        if (document.querySelector('link[href*="liquid-glass-dispersion.css"]')) return;

        const link = document.createElement('link');
        link.id = GLASS_CSS_ID;
        link.rel = 'stylesheet';
        link.href = GLASS_CSS_URL;
        document.head.appendChild(link);
    }

    function injectRangeGlassStyle() {
        if (!document.head) return;
        if (document.getElementById(RANGE_STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = RANGE_STYLE_ID;
        style.textContent = `
[${RANGE_ATTR}="true"] {
    background-color: transparent !important;
    background: transparent linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.1) 100%) !important;
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.1) 100%) !important;
    backdrop-filter: blur(6px) saturate(180%) contrast(1.05) !important;
    -webkit-backdrop-filter: blur(6px) saturate(180%) contrast(1.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow:
        inset 2px 0 4px rgba(0, 255, 255, 0.2),
        inset -2px 0 4px rgba(255, 0, 255, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.6),
        0 4px 10px rgba(0, 0, 0, 0.05) !important;
    border-radius: 999px !important;
    isolation: isolate !important;
    overflow: visible !important;
    transition: all 0.3s ease !important;
}

[${RANGE_ATTR}="true"]:hover {
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.2) 100%) !important;
    backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    -webkit-backdrop-filter: blur(8px) saturate(200%) contrast(1.1) !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
    box-shadow:
        inset 3px 0 6px rgba(0, 255, 255, 0.3),
        inset -3px 0 6px rgba(255, 0, 255, 0.25),
        inset 0 1px 3px rgba(255, 255, 255, 0.8),
        0 8px 20px rgba(0, 0, 0, 0.1) !important;
}

[${RANGE_ITEM_ATTR}="true"] {
    background: transparent !important;
    border-radius: 999px !important;
    color: var(--text-secondary, rgba(0, 0, 0, 0.55)) !important;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.55) !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

[${RANGE_ITEM_ATTR}="true"]:hover {
    color: var(--text-primary, rgba(0, 0, 0, 0.85)) !important;
    filter: brightness(1.08) !important;
}

[${RANGE_ACTIVE_ATTR}="true"] {
    color: var(--text-primary, rgba(0, 0, 0, 0.85)) !important;
    font-weight: 700 !important;
}

[${RANGE_ACTIVE_ATTR}="true"] > .absolute.inset-0,
[${RANGE_ACTIVE_ATTR}="true"] .absolute.inset-0 {
    background: transparent linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0.25) 100%) !important;
    backdrop-filter: blur(6px) saturate(180%) contrast(1.05) !important;
    -webkit-backdrop-filter: blur(6px) saturate(180%) contrast(1.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow:
        inset 2px 0 4px rgba(0, 255, 255, 0.2),
        inset -2px 0 4px rgba(255, 0, 255, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.6),
        0 4px 10px rgba(0, 0, 0, 0.05) !important;
    border-radius: 999px !important;
}

[${RANGE_ITEM_ATTR}="true"][class*="cursor-not-allowed"],
[${RANGE_ITEM_ATTR}="true"][data-state="closed"] {
    opacity: 0.48 !important;
    filter: grayscale(1) !important;
}

html.dark [${RANGE_ATTR}="true"],
.dark [${RANGE_ATTR}="true"],
[data-theme="dark"] [${RANGE_ATTR}="true"] {
    background-color: transparent !important;
    background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.01) 50%, rgba(0, 0, 0, 0.1) 100%) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
    box-shadow:
        inset 2px 0 4px rgba(0, 255, 255, 0.2),
        inset -2px 0 4px rgba(255, 0, 255, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.1),
        0 4px 10px rgba(0, 0, 0, 0.2) !important;
}

html.dark [${RANGE_ATTR}="true"]:hover,
.dark [${RANGE_ATTR}="true"]:hover,
[data-theme="dark"] [${RANGE_ATTR}="true"]:hover {
    background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.08) 100%) !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow:
        inset 3px 0 6px rgba(0, 255, 255, 0.3),
        inset -3px 0 6px rgba(255, 0, 255, 0.25),
        inset 0 1px 3px rgba(255, 255, 255, 0.15),
        0 8px 20px rgba(0, 0, 0, 0.3) !important;
}

html.dark [${RANGE_ITEM_ATTR}="true"],
.dark [${RANGE_ITEM_ATTR}="true"],
[data-theme="dark"] [${RANGE_ITEM_ATTR}="true"] {
    color: var(--text-secondary, rgba(255, 255, 255, 0.6)) !important;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9) !important;
}

html.dark [${RANGE_ACTIVE_ATTR}="true"],
.dark [${RANGE_ACTIVE_ATTR}="true"],
[data-theme="dark"] [${RANGE_ACTIVE_ATTR}="true"] {
    color: var(--text-primary, rgba(255, 255, 255, 0.92)) !important;
}

html.dark [${RANGE_ACTIVE_ATTR}="true"] > .absolute.inset-0,
html.dark [${RANGE_ACTIVE_ATTR}="true"] .absolute.inset-0,
.dark [${RANGE_ACTIVE_ATTR}="true"] > .absolute.inset-0,
.dark [${RANGE_ACTIVE_ATTR}="true"] .absolute.inset-0,
[data-theme="dark"] [${RANGE_ACTIVE_ATTR}="true"] > .absolute.inset-0,
[data-theme="dark"] [${RANGE_ACTIVE_ATTR}="true"] .absolute.inset-0 {
    background: transparent linear-gradient(170deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0.1) 100%) !important;
    border-color: rgba(255, 255, 255, 0.15) !important;
    box-shadow:
        inset 2px 0 4px rgba(0, 255, 255, 0.2),
        inset -2px 0 4px rgba(255, 0, 255, 0.15),
        inset 0 1px 2px rgba(255, 255, 255, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

[${PEAK_GROUP_ATTR}="true"] {
    position: relative !important;
    top: ${RANGE_BAR_OFFSET_Y} !important;
}

`;
        document.head.appendChild(style);
    }

    function getContainer() {
        return document.querySelector(CONTAINER_SELECTOR);
    }

    function getDirectDivs(container) {
        if (!container) return [];
        return Array.from(container.children).filter((node) => node.tagName === 'DIV');
    }

    function getMarkedPanel(container, attrName) {
        const panel = container.querySelector(`[${attrName}="true"]`);
        return panel && panel.parentElement === container ? panel : null;
    }

    function findDetailPanel(container) {
        const marked = getMarkedPanel(container, DETAIL_ATTR);
        if (marked && marked.querySelector('.server-charts')) {
            return marked;
        }

        return getDirectDivs(container).find((node) => node.querySelector('.server-charts')) || null;
    }

    function isTabSection(node) {
        return Boolean(node.closest(TAB_SELECTOR));
    }

    function findNetworkPanel(container, detailPanel) {
        const marked = getMarkedPanel(container, NETWORK_ATTR);
        if (marked && marked !== detailPanel) {
            return marked;
        }

        const directDivs = getDirectDivs(container);
        const detailIndex = directDivs.indexOf(detailPanel);
        if (detailIndex === -1) return null;

        return directDivs.slice(detailIndex + 1).find((node) => {
            return node !== detailPanel &&
                !node.querySelector('.server-charts') &&
                !isTabSection(node);
        }) || null;
    }

    function getPanels() {
        const container = getContainer();
        if (!container) {
            return { container: null, detailPanel: null, networkPanel: null };
        }

        const detailPanel = findDetailPanel(container);
        const networkPanel = detailPanel ? findNetworkPanel(container, detailPanel) : null;

        if (detailPanel) {
            detailPanel.setAttribute(DETAIL_ATTR, 'true');
        }
        if (networkPanel) {
            networkPanel.setAttribute(NETWORK_ATTR, 'true');
        }

        return { container, detailPanel, networkPanel };
    }

    function findNetworkButton() {
        const tab = document.querySelector(TAB_SELECTOR);
        if (!tab) return null;

        const candidates = Array.from(tab.querySelectorAll('button, [role="tab"], .cursor-pointer, [class*="cursor-pointer"]'));
        const byText = candidates.find((node) => {
            const text = (node.textContent || '').trim().toLowerCase();
            return text === '网络' || text === 'network' || text.includes('网络') || text.includes('network');
        });

        if (byText) return byText;

        return tab.querySelector('.relative.cursor-pointer.text-stone-400.dark\\:text-stone-500');
    }

    function findRangeBars() {
        const container = getContainer();
        if (!container) return [];

        return Array.from(container.querySelectorAll('.rounded-full, .flex.flex-wrap')).filter((node) => {
            const text = node.textContent || '';
            const hasRangeLabels = text.includes('1 天') &&
                text.includes('7 天') &&
                text.includes('30 天');

            if (!hasRangeLabels || !node.classList.contains('rounded-full')) {
                return false;
            }

            return text.includes('实时') ||
                node.classList.contains('gap-1') ||
                node.classList.contains('gap-0.5') ||
                node.classList.contains('bg-muted') ||
                node.classList.contains('dark:bg-muted/40');
        });
    }

    function isRangeItemLabel(text) {
        return text === '实时' ||
            text === '1 天' ||
            text === '7 天' ||
            text === '30 天';
    }

    function markRangeBar(rangeBar) {
        rangeBar.setAttribute(RANGE_ATTR, 'true');
        rangeBar.classList.remove('bg-muted', 'dark:bg-muted/40');

        Array.from(rangeBar.querySelectorAll('div')).forEach((node) => {
            const text = (node.textContent || '').trim();
            const isPill = node.classList.contains('relative') &&
                node.classList.contains('rounded-full');

            if (!isPill || !isRangeItemLabel(text)) return;

            node.setAttribute(RANGE_ITEM_ATTR, 'true');

            if (node.querySelector('.absolute.inset-0') ||
                (node.classList.contains('text-foreground') && !node.classList.contains('text-muted-foreground'))) {
                node.setAttribute(RANGE_ACTIVE_ATTR, 'true');
            } else {
                node.removeAttribute(RANGE_ACTIVE_ATTR);
            }
        });
    }

    function adjustPeakControl() {
        const peakButton = document.querySelector('#Peak');
        if (!peakButton) return;

        const peakGroup = peakButton.closest('.flex.items-center.space-x-2');
        if (peakGroup) {
            peakGroup.setAttribute(PEAK_GROUP_ATTR, 'true');
        }
    }

    function adjustRangeBarPosition() {
        const rangeBars = findRangeBars();
        const activeRangeBars = new Set(rangeBars);
        const container = getContainer();

        if (container) {
            container.querySelectorAll(`[${RANGE_ATTR}="true"]`).forEach((node) => {
                if (activeRangeBars.has(node)) return;

                node.removeAttribute(RANGE_ATTR);
                node.style.removeProperty('top');
                node.style.removeProperty('position');
            });
        }

        rangeBars.forEach((rangeBar) => {
            markRangeBar(rangeBar);
            rangeBar.style.setProperty('position', 'relative', 'important');
            rangeBar.style.setProperty('top', RANGE_BAR_OFFSET_Y, 'important');
        });

        adjustPeakControl();
    }

    function hideTabSection() {
        const tab = document.querySelector(TAB_SELECTOR);
        if (tab) {
            setImportantDisplay(tab, 'none');
        }
    }

    function forceBothVisible() {
        const { detailPanel, networkPanel } = getPanels();
        setImportantDisplay(detailPanel, 'block');
        setImportantDisplay(networkPanel, 'block');
    }

    function moveNetworkBeforeDetail() {
        const { detailPanel, networkPanel } = getPanels();
        if (!detailPanel || !networkPanel || detailPanel.parentNode !== networkPanel.parentNode) {
            return;
        }

        const networkAfterDetail = detailPanel.compareDocumentPosition(networkPanel) &
            Node.DOCUMENT_POSITION_FOLLOWING;

        if (networkAfterDetail) {
            detailPanel.parentNode.insertBefore(networkPanel, detailPanel);
            log('Network panel moved before detail panel');
        }
    }

    function tryClickPeak(retryCount) {
        if (hasClickedPeak) return;

        const peakButton = document.querySelector('#Peak');
        if (peakButton) {
            peakButton.click();
            hasClickedPeak = true;
            log('Peak button clicked');
            return;
        }

        if (retryCount > 0) {
            setTimeout(() => tryClickPeak(retryCount - 1), 200);
        }
    }

    function tryClickNetworkButton() {
        if (hasClickedNetwork) return;

        const button = findNetworkButton();
        if (!button) return;

        button.click();
        hasClickedNetwork = true;
        log('Network tab clicked');

        setTimeout(() => {
            forceBothVisible();
            moveNetworkBeforeDetail();
            tryClickPeak(PEAK_RETRY_LIMIT);
        }, 300);
    }

    function resetOnRouteChange() {
        if (location.href === lastUrl) return;

        lastUrl = location.href;
        hasClickedNetwork = false;
        hasClickedPeak = false;
        missingNetworkCount = 0;
        log('Route changed, state reset');
    }

    function injectLayout() {
        injectExternalGlassStylesheet();
        injectRangeGlassStyle();
        resetOnRouteChange();

        const container = getContainer();
        if (!container) return;

        const { detailPanel, networkPanel } = getPanels();
        if (hasClickedNetwork && detailPanel && !networkPanel) {
            missingNetworkCount += 1;
            if (missingNetworkCount >= 3) {
                hasClickedNetwork = false;
                hasClickedPeak = false;
                missingNetworkCount = 0;
            }
        } else if (networkPanel) {
            missingNetworkCount = 0;
        }

        tryClickNetworkButton();
        hideTabSection();
        forceBothVisible();
        moveNetworkBeforeDetail();
        adjustRangeBarPosition();
        tryClickPeak(0);
    }

    function scheduleInject() {
        if (debounceTimer) return;

        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            injectLayout();
        }, OBSERVER_DEBOUNCE_MS);
    }

    function startObserver() {
        injectExternalGlassStylesheet();
        injectRangeGlassStyle();

        if (observer) {
            injectLayout();
            return;
        }

        const root = document.querySelector(ROOT_SELECTOR);
        if (!root) {
            if (!startRetryTimer && startRetryCount < START_RETRY_LIMIT) {
                startRetryCount += 1;
                startRetryTimer = setTimeout(() => {
                    startRetryTimer = null;
                    startObserver();
                }, START_RETRY_MS);
            }
            return;
        }

        observer = new MutationObserver(scheduleInject);
        observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        injectLayout();
        recoveryTimer = setInterval(injectLayout, RECOVERY_INTERVAL_MS);
        log('Observer started');
    }

    function stop() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        if (recoveryTimer) {
            clearInterval(recoveryTimer);
            recoveryTimer = null;
        }
        if (startRetryTimer) {
            clearTimeout(startRetryTimer);
            startRetryTimer = null;
        }
    }

    window[INSTANCE_KEY] = {
        stop,
        start: startObserver,
        refresh: injectLayout,
    };
    window.NetstatusAutoshow = window[INSTANCE_KEY];

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    } else {
        startObserver();
    }

    window.addEventListener('beforeunload', stop, { once: true });
})();
