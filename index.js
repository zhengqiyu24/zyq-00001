/**
 * Entry Point - Initialize Four Layers and Connect Data Flow
 * 入口文件：初始化四层并建立数据流
 */

(function(window) {
    function showToast(message, type = 'error') {
        const container = document.getElementById('toastContainer');
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

    function init() {
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);