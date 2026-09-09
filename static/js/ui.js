class UIManager {
    constructor() {
        this.wsStatus = document.getElementById('ws-status');
        this.leds = {
            esp32: document.getElementById('status-esp32'),
            wifi: document.getElementById('status-wifi'), // Assuming true if ws is connected
            mpu: document.getElementById('status-mpu'),
            lidar: document.getElementById('status-lidar'),
            camLeft: document.getElementById('status-cam-left'),
            camRight: document.getElementById('status-cam-right')
        };
        
        if (ROVER_CONFIG.demoMode) {
            document.getElementById('demo-banner').classList.remove('hidden');
        }
    }

    updateWsStatus(connected) {
        if (connected) {
            this.wsStatus.textContent = 'WebSocket: Connected';
            this.wsStatus.style.color = 'var(--success)';
            this.setLed(this.leds.wifi, true);
        } else {
            this.wsStatus.textContent = 'WebSocket: Disconnected';
            this.wsStatus.style.color = 'var(--danger)';
            this.setLed(this.leds.wifi, false);
            this.setLed(this.leds.esp32, false);
        }
    }

    setLed(element, state) {
        if (!element) return;
        if (state) {
            element.classList.add('on');
            element.classList.remove('error');
        } else {
            element.classList.remove('on');
            element.classList.add('error');
        }
    }

    updateConnections(connections) {
        this.setLed(this.leds.esp32, connections.esp32);
        this.setLed(this.leds.mpu, connections.mpu6050);
        this.setLed(this.leds.lidar, connections.lidar);
        this.setLed(this.leds.camLeft, connections.camera_left);
        this.setLed(this.leds.camRight, connections.camera_right);
    }
}

const ui = new UIManager();
