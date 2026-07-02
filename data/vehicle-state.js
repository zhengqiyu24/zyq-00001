/**
 * Data Layer - Vehicle State Model
 * 车辆状态数据模型与发布订阅机制
 */

(function(window) {
    const VehicleState = {
        plateNumber: '京A12345',
        vehicleModel: 'Model X',
        vin: 'LSGBL5333KF123456',
        totalMileage: 12580,
        gear: 'P',
        electronicBrake: false,
        autoHold: false,
        locked: false,
        batteryLevel: 85,
        avgConsumption: 18.5,
        totalPower: 80,
        remainingPower: 68,
        range: 420
    };

    const subscribers = [];

    function getState() {
        return { ...VehicleState };
    }

    function updateState(updates) {
        Object.assign(VehicleState, updates);
        notifySubscribers();
    }

    function subscribe(callback) {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        };
    }

    function notifySubscribers() {
        const state = getState();
        subscribers.forEach(callback => callback(state));
    }

    function calculateRange() {
        const { remainingPower, avgConsumption } = VehicleState;
        return Math.round((remainingPower / avgConsumption) * 100);
    }

    function decrementBattery(amount) {
        VehicleState.remainingPower = Math.max(0, VehicleState.remainingPower - amount);
        VehicleState.batteryLevel = Math.round((VehicleState.remainingPower / VehicleState.totalPower) * 100);
        VehicleState.range = calculateRange();
        notifySubscribers();
    }

    function incrementMileage(distance) {
        VehicleState.totalMileage += distance;
        notifySubscribers();
    }

    window.VehicleStateData = {
        getState,
        updateState,
        subscribe,
        calculateRange,
        decrementBattery,
        incrementMileage
    };
})(window);