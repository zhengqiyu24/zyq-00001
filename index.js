/**
 * Entry Point - Initialize Four Layers and Connect Data Flow
 * 入口文件：初始化四层并建立数据流，包含登录验证
 */

(function(window) {
    const LOGIN_STATE_KEY = 'vehicle_monitor_login';
    const REMEMBER_ME_KEY = 'vehicle_monitor_remember';

    function showToast(message, type = 'error') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    function showLoginPage() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
        document.body.style.overflow = 'hidden';
    }

    function showDashboard() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.body.style.overflow = 'auto';
    }

    function checkLoginState() {
        const loginState = localStorage.getItem(LOGIN_STATE_KEY);
        if (loginState) {
            try {
                const state = JSON.parse(loginState);
                if (state.issuedAt && Date.now() - state.issuedAt < 86400000) {
                    return true;
                }
            } catch (e) {
                localStorage.removeItem(LOGIN_STATE_KEY);
            }
        }
        return false;
    }

    function saveLoginState(username) {
        localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify({
            username,
            issuedAt: Date.now()
        }));
    }

    function clearLoginState() {
        localStorage.removeItem(LOGIN_STATE_KEY);
    }

    function saveRememberMe(username, password) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
            username,
            password
        }));
    }

    function getRememberMe() {
        const data = localStorage.getItem(REMEMBER_ME_KEY);
        return data ? JSON.parse(data) : null;
    }

    function clearRememberMe() {
        localStorage.removeItem(REMEMBER_ME_KEY);
    }

    function validateLogin(username, password) {
        return username === 'admin' && password === '123456';
    }

    function initLogin() {
        const form = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.getElementById('rememberMe');
        const passwordToggle = document.getElementById('passwordToggle');

        const remembered = getRememberMe();
        if (remembered) {
            usernameInput.value = remembered.username;
            passwordInput.value = remembered.password;
            rememberMeInput.checked = true;
        }

        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showToast('请输入用户名和密码');
                return;
            }

            if (validateLogin(username, password)) {
                saveLoginState(username);
                
                if (rememberMeInput.checked) {
                    saveRememberMe(username, password);
                } else {
                    clearRememberMe();
                }

                showDashboard();
                initDashboard();
            } else {
                showToast('用户名或密码错误');
            }
        });
    }

    function initDashboard() {
        const state = VehicleStateData.getState();
        const logs = VehicleLogic.getLogs();
        
        VehicleRenderer.render(state, logs);
        VehicleRenderer.renderCurrentTime();

        function handleShiftGear(targetGear) {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.shiftGear(targetGear, currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            const updates = { gear: result.gear };
            if (targetGear === 'P') {
                updates.electronicBrake = true;
            }
            VehicleStateData.updateState(updates);
        }

        function handlePullBrake() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.pullBrake(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.updateState({ electronicBrake: true });
        }

        function handleReleaseBrake() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.releaseBrake(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.updateState({ electronicBrake: false });
        }

        function handleToggleAutoHold() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.toggleAutoHold(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.updateState({ autoHold: result.autoHold });
        }

        function handleLock() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.lockVehicle(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.updateState({ locked: true });
        }

        function handleUnlock() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.unlockVehicle(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.updateState({ locked: false });
        }

        function handleSimulateDriving() {
            const currentState = VehicleStateData.getState();
            const result = VehicleLogic.simulateDriving(currentState);
            
            if (!result.valid) {
                showToast(result.reason);
                return;
            }
            
            VehicleStateData.decrementBattery(result.powerConsumed);
            VehicleStateData.incrementMileage(result.distance);
        }

        function render() {
            const currentState = VehicleStateData.getState();
            const currentLogs = VehicleLogic.getLogs();
            VehicleRenderer.render(currentState, currentLogs);
        }

        function handleLogout() {
            clearLoginState();
            showLoginPage();
        }

        VehicleStateData.subscribe(render);

        VehicleEventBinder.bindEvents({
            onShiftGear: handleShiftGear,
            onPullBrake: handlePullBrake,
            onReleaseBrake: handleReleaseBrake,
            onToggleAutoHold: handleToggleAutoHold,
            onLock: handleLock,
            onUnlock: handleUnlock,
            onSimulateDriving: handleSimulateDriving
        });

        VehicleEventBinder.bindKeyEvents({
            onShiftGear: handleShiftGear,
            onPullBrake: handlePullBrake,
            onReleaseBrake: handleReleaseBrake,
            onToggleAutoHold: handleToggleAutoHold,
            onLock: handleLock,
            onUnlock: handleUnlock,
            onSimulateDriving: handleSimulateDriving
        });

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', handleLogout);

        const drivingInterval = setInterval(() => {
            const currentState = VehicleStateData.getState();
            if (currentState.gear === 'D') {
                handleSimulateDriving();
            }
        }, 5000);

        window.addEventListener('beforeunload', () => {
            clearInterval(drivingInterval);
        });
    }

    function init() {
        if (checkLoginState()) {
            showDashboard();
            initDashboard();
        } else {
            initLogin();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);