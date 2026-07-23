/**
 * Performance Monitoring Utility
 * Tracks page load times and provides performance metrics
 */

export const measurePageLoad = () => {
    if (typeof window === 'undefined' || !window.performance) {
        return null;
    }

    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

    return {
        pageLoadTime: pageLoadTime / 1000, // Convert to seconds
        connectTime: connectTime / 1000,
        renderTime: renderTime / 1000,
        domReadyTime: domReadyTime / 1000,
    };
};

export const logPerformanceMetrics = (pageName = 'Page') => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            const metrics = measurePageLoad();
            if (metrics && process.env.NODE_ENV === 'development') {
                console.log(`📊 ${pageName} Performance Metrics:`);
                console.log(`   Total Load Time: ${metrics.pageLoadTime.toFixed(2)}s`);
                console.log(`   DOM Ready Time: ${metrics.domReadyTime.toFixed(2)}s`);
                console.log(`   Render Time: ${metrics.renderTime.toFixed(2)}s`);
                console.log(`   Connect Time: ${metrics.connectTime.toFixed(2)}s`);
                
                if (metrics.pageLoadTime > 2) {
                    console.warn(`⚠️ Page load time exceeds 2 seconds target`);
                }
            }
        }, 0);
    });
};

export const measureComponentRender = (componentName) => {
    if (typeof window === 'undefined' || !window.performance) {
        return { start: () => {}, end: () => {} };
    }

    return {
        start: () => {
            window.performance.mark(`${componentName}-start`);
        },
        end: () => {
            window.performance.mark(`${componentName}-end`);
            window.performance.measure(
                componentName,
                `${componentName}-start`,
                `${componentName}-end`
            );
            
            if (process.env.NODE_ENV === 'development') {
                const measure = window.performance.getEntriesByName(componentName)[0];
                if (measure) {
                    console.log(`⚡ ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);
                }
            }
        },
    };
};
