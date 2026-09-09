class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.callbacks = {
            onTelemetry: []
        };
    }

    connect() {
        this.socket = io();

        this.socket.on('connect', () => {
            this.connected = true;
            console.log('WebSocket Connected');
            ui.updateWsStatus(true);
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('WebSocket Disconnected');
            ui.updateWsStatus(false);
            // Safety measure on disconnect
            controls.resetState();
        });

        this.socket.on('telemetry_update', (data) => {
            this.callbacks.onTelemetry.forEach(cb => cb(data));
        });
    }

    onTelemetry(callback) {
        this.callbacks.onTelemetry.push(callback);
    }

    sendCommand(command, speed = null) {
        if (!this.connected) return;
        
        const payload = { command: command };
        if (speed !== null) {
            payload.speed = speed;
        }
        
        this.socket.emit('motor_command', payload);
    }
}

const ws = new WebSocketManager();
