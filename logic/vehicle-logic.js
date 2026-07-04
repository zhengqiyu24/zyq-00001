/**
 * Logic Layer - Vehicle Business Rules
 * 车辆业务规则校验与续航计算
 */

(function(window) {
    const logs = [];

    function addLog(action, result, reason) {
        const log = {
            id: Date.now(),
            time: new Date().toLocaleString('zh-CN'),
            action,
            result,
            reason
        };
        logs.unshift(log);
        if (logs.length > 50) {
            logs.pop();
        }
        return log;
    }

    function getLogs() {
        return [...logs];
    }

    function validateShiftGear(targetGear, currentState) {
        const { gear, electronicBrake, speed } = currentState;
        const currentSpeed = speed || 0;

        if (targetGear === gear) {
            return { valid: false, reason: '已处于该挡位' };
        }

        if (currentSpeed > 5 && targetGear !== 'D' && targetGear !== 'N') {
            return { valid: false, reason: '车速过快，无法切换挡位' };
        }

        if (targetGear === 'R' && (gear === 'D' || currentSpeed > 0)) {
            return { valid: false, reason: '前进中无法挂倒挡' };
        }

        if (targetGear === 'P' && currentSpeed > 0) {
            return { valid: false, reason: '行驶中无法挂驻车挡' };
        }

        if (targetGear === 'P' && !electronicBrake && !currentState.autoHold) {
            return { valid: true, reason: '建议先拉起电子手刹' };
        }

        return { valid: true, reason: '' };
    }

    function shiftGear(targetGear, currentState) {
        const validation = validateShiftGear(targetGear, currentState);
        if (!validation.valid) {
            addLog(`挂${targetGear}挡`, '失败', validation.reason);
            return validation;
        }

        let reason = `成功挂入${targetGear}挡`;
        if (targetGear === 'P') {
            reason += '，自动拉起电子手刹';
        }

        addLog(`挂${targetGear}挡`, '成功', reason);
        return { valid: true, reason, gear: targetGear };
    }

    function validateBrakePull(currentState) {
        if (currentState.electronicBrake) {
            return { valid: false, reason: '电子手刹已拉起' };
        }
        return { valid: true, reason: '' };
    }

    function pullBrake(currentState) {
        const validation = validateBrakePull(currentState);
        if (!validation.valid) {
            addLog('拉起手刹', '失败', validation.reason);
            return validation;
        }

        addLog('拉起手刹', '成功', '电子手刹已拉起');
        return { valid: true, reason: '电子手刹已拉起', electronicBrake: true };
    }

    function validateBrakeRelease(currentState) {
        if (!currentState.electronicBrake) {
            return { valid: false, reason: '电子手刹未拉起' };
        }
        return { valid: true, reason: '' };
    }

    function releaseBrake(currentState) {
        const validation = validateBrakeRelease(currentState);
        if (!validation.valid) {
            addLog('释放手刹', '失败', validation.reason);
            return validation;
        }

        addLog('释放手刹', '成功', '电子手刹已释放');
        return { valid: true, reason: '电子手刹已释放', electronicBrake: false };
    }

    function toggleAutoHold(currentState) {
        const newValue = !currentState.autoHold;
        const action = newValue ? '开启' : '关闭';
        addLog(`${action}自动驻车`, '成功', `自动驻车${action}`);
        return { valid: true, reason: `自动驻车${action}`, autoHold: newValue };
    }

    function validateLock(currentState) {
        if (currentState.locked) {
            return { valid: false, reason: '车辆已上锁' };
        }
        if (currentState.gear !== 'P') {
            return { valid: false, reason: '挡位未挂入P挡' };
        }
        if (!currentState.electronicBrake) {
            return { valid: false, reason: '电子手刹未拉起' };
        }
        return { valid: true, reason: '' };
    }

    function lockVehicle(currentState) {
        const validation = validateLock(currentState);
        if (!validation.valid) {
            addLog('锁车', '失败', validation.reason);
            return validation;
        }

        addLog('锁车', '成功', '车辆已上锁');
        return { valid: true, reason: '车辆已上锁', locked: true };
    }

    function validateUnlock(currentState) {
        if (!currentState.locked) {
            return { valid: false, reason: '车辆未上锁' };
        }
        return { valid: true, reason: '' };
    }

    function unlockVehicle(currentState) {
        const validation = validateUnlock(currentState);
        if (!validation.valid) {
            addLog('解锁', '失败', validation.reason);
            return validation;
        }

        addLog('解锁', '成功', '车辆已解锁');
        return { valid: true, reason: '车辆已解锁', locked: false };
    }

    function simulateDriving(currentState) {
        if (currentState.gear !== 'D') {
            return { valid: false, reason: '未挂入D挡，无法模拟行驶' };
        }

        if (currentState.remainingPower <= 0) {
            return { valid: false, reason: '电量已耗尽，无法继续行驶' };
        }

        const distance = Math.round(Math.random() * 5 + 1);
        const powerConsumed = (distance / 100) * currentState.avgConsumption;
        
        if (powerConsumed > currentState.remainingPower) {
            const maxDistance = Math.round((currentState.remainingPower / currentState.avgConsumption) * 100);
            const actualPower = currentState.remainingPower;
            addLog('模拟行驶', '成功', `行驶${maxDistance}km，电量已耗尽`);
            return {
                valid: true,
                reason: `行驶${maxDistance}km，电量已耗尽`,
                distance: maxDistance,
                powerConsumed: actualPower
            };
        }

        addLog('模拟行驶', '成功', `行驶${distance}km，消耗电量${powerConsumed.toFixed(2)}kWh`);
        
        return {
            valid: true,
            reason: `行驶${distance}km`,
            distance,
            powerConsumed
        };
    }

    window.VehicleLogic = {
        addLog,
        getLogs,
        shiftGear,
        pullBrake,
        releaseBrake,
        toggleAutoHold,
        lockVehicle,
        unlockVehicle,
        simulateDriving,
        validateShiftGear,
        validateBrakePull,
        validateBrakeRelease,
        validateLock,
        validateUnlock
    };
})(window);