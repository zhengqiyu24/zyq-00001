/**
 * Event Layer - Event Binding and Dispatching
 * 事件绑定与分发，仅采集用户操作意图并调用Logic层
 */

(function(window) {
    function bindEvents(handlers) {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            
            switch (action) {
                case 'shift-p':
                    handlers.onShiftGear('P');
                    break;
                case 'shift-r':
                    handlers.onShiftGear('R');
                    break;
                case 'shift-n':
                    handlers.onShiftGear('N');
                    break;
                case 'shift-d':
                    handlers.onShiftGear('D');
                    break;
                case 'brake-pull':
                    handlers.onPullBrake();
                    break;
                case 'brake-release':
                    handlers.onReleaseBrake();
                    break;
                case 'auto-hold-toggle':
                    handlers.onToggleAutoHold();
                    break;
                case 'lock':
                    handlers.onLock();
                    break;
                case 'unlock':
                    handlers.onUnlock();
                    break;
                case 'simulate-driving':
                    handlers.onSimulateDriving();
                    break;
            }
        });
    }

    function bindKeyEvents(handlers) {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toUpperCase()) {
                case 'P':
                    handlers.onShiftGear('P');
                    break;
                case 'R':
                    handlers.onShiftGear('R');
                    break;
                case 'N':
                    handlers.onShiftGear('N');
                    break;
                case 'D':
                    handlers.onShiftGear('D');
                    break;
                case 'B':
                    if (e.shiftKey) {
                        handlers.onReleaseBrake();
                    } else {
                        handlers.onPullBrake();
                    }
                    break;
                case 'H':
                    handlers.onToggleAutoHold();
                    break;
                case 'L':
                    if (e.shiftKey) {
                        handlers.onUnlock();
                    } else {
                        handlers.onLock();
                    }
                    break;
                case 'G':
                    handlers.onSimulateDriving();
                    break;
            }
        });
    }

    window.VehicleEventBinder = {
        bindEvents,
        bindKeyEvents
    };
})(window);