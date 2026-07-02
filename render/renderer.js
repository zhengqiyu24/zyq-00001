/**
 * Render Layer - Pure DOM Rendering Functions
 * 纯DOM渲染函数，接收状态数据输出HTML
 */

(function(window) {
    function renderVehicleInfo(state) {
        document.getElementById('plateNumber').textContent = state.plateNumber;
        document.getElementById('vehicleModel').textContent = state.vehicleModel;
        document.getElementById('vin').textContent = state.vin;
        document.getElementById('totalMileage').textContent = 
            state.totalMileage.toLocaleString() + ' km';
    }

    function renderGear(state) {
        document.querySelectorAll('.gear-indicator').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.gear === state.gear) {
                el.classList.add('active');
            }
        });
        document.getElementById('currentGear').textContent = state.gear;
    }

    function renderBrake(state) {
        const icon = document.getElementById('brakeIcon');
        const status = document.getElementById('brakeStatus');
        
        if (state.electronicBrake) {
            icon.classList.add('active');
            status.textContent = '拉起';
            status.classList.add('active');
        } else {
            icon.classList.remove('active');
            status.textContent = '释放';
            status.classList.remove('active');
        }
    }

    function renderAutoHold(state) {
        const icon = document.getElementById('autoHoldIcon');
        const status = document.getElementById('autoHoldStatus');
        const slider = document.getElementById('autoHoldSlider');
        
        if (state.autoHold) {
            icon.classList.add('active');
            status.textContent = '开启';
            status.classList.add('active');
            slider.classList.add('active');
        } else {
            icon.classList.remove('active');
            status.textContent = '关闭';
            status.classList.remove('active');
            slider.classList.remove('active');
        }
    }

    function renderLock(state) {
        const icon = document.getElementById('lockIcon');
        const status = document.getElementById('lockStatus');
        
        if (state.locked) {
            icon.textContent = '🔒';
            icon.classList.add('locked');
            icon.classList.remove('unlocked');
            status.textContent = '上锁';
            status.classList.add('locked');
        } else {
            icon.textContent = '🔓';
            icon.classList.add('unlocked');
            icon.classList.remove('locked');
            status.textContent = '解锁';
            status.classList.remove('locked');
        }
    }

    function renderRange(state) {
        const rangeValue = document.getElementById('rangeValue');
        const rangeProgress = document.getElementById('rangeProgress');
        const batteryProgress = document.getElementById('batteryProgress');
        const batteryLevel = document.getElementById('batteryLevel');
        const avgConsumption = document.getElementById('avgConsumption');
        const remainingPower = document.getElementById('remainingPower');
        const totalPower = document.getElementById('totalPower');

        rangeValue.textContent = state.range;
        
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (state.batteryLevel / 100) * circumference;
        rangeProgress.style.strokeDashoffset = offset;
        
        const color = state.batteryLevel > 50 ? '#4caf50' : state.batteryLevel > 20 ? '#ff9800' : '#f44336';
        rangeProgress.style.stroke = color;
        
        batteryProgress.style.width = state.batteryLevel + '%';
        batteryProgress.style.backgroundColor = color;
        
        batteryLevel.textContent = state.batteryLevel + '%';
        avgConsumption.textContent = state.avgConsumption + ' kWh/100km';
        remainingPower.textContent = state.remainingPower.toFixed(1) + ' kWh';
        totalPower.textContent = state.totalPower + ' kWh';
    }

    function renderLogs(logs) {
        const container = document.getElementById('logContainer');
        const count = document.getElementById('logCount');
        
        count.textContent = logs.length;
        
        if (logs.length === 0) {
            container.innerHTML = '<div class="empty-log">暂无操作记录</div>';
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-item ${log.result === '成功' ? 'success' : 'failure'}">
                <span class="log-time">${log.time}</span>
                <span class="log-action">${log.action}</span>
                <span class="log-result ${log.result === '成功' ? 'success' : 'failure'}">${log.result}</span>
                <span class="log-reason">${log.reason}</span>
            </div>
        `).join('');
    }

    function renderCurrentTime() {
        const timeEl = document.getElementById('currentTime');
        const updateTime = () => {
            timeEl.textContent = new Date().toLocaleString('zh-CN');
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    function render(state, logs) {
        renderVehicleInfo(state);
        renderGear(state);
        renderBrake(state);
        renderAutoHold(state);
        renderLock(state);
        renderRange(state);
        renderLogs(logs);
    }

    window.VehicleRenderer = {
        render,
        renderVehicleInfo,
        renderGear,
        renderBrake,
        renderAutoHold,
        renderLock,
        renderRange,
        renderLogs,
        renderCurrentTime
    };
})(window);