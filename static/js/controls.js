class ControlManager {
    constructor() {
        this.speedSlider = document.getElementById('speed-slider');
        this.speedDisplay = document.getElementById('speed-display');
        
        this.motorElements = {
            fl: document.getElementById('motor-fl'),
            fr: document.getElementById('motor-fr'),
            bl: document.getElementById('motor-bl'),
            br: document.getElementById('motor-br')
        };
        
        this.currentSpeed = 200;
        this.setupListeners();
    }

    setupListeners() {
        // Speed
        this.speedSlider.addEventListener('input', (e) => {
            this.currentSpeed = parseInt(e.target.value);
            this.speedDisplay.textContent = this.currentSpeed;
            ws.sendCommand('speed', this.currentSpeed);
        });

        // Directional Buttons (Mouse/Touch)
        this.bindButton('btn-forward', 'forward');
        this.bindButton('btn-backward', 'backward');
        this.bindButton('btn-left', 'left');
        this.bindButton('btn-right', 'right');
        
        // Stop buttons
        document.getElementById('btn-stop').addEventListener('click', () => ws.sendCommand('stop'));
        document.getElementById('btn-estop').addEventListener('click', () => ws.sendCommand('emergency_stop'));

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            switch(e.key) {
                case 'ArrowUp': case 'w': ws.sendCommand('forward', this.currentSpeed); break;
                case 'ArrowDown': case 's': ws.sendCommand('backward', this.currentSpeed); break;
                case 'ArrowLeft': case 'a': ws.sendCommand('left', this.currentSpeed); break;
                case 'ArrowRight': case 'd': ws.sendCommand('right', this.currentSpeed); break;
                case ' ': ws.sendCommand('stop'); break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                ws.sendCommand('stop');
            }
        });
    }

    bindButton(id, command) {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e) => { e.preventDefault(); ws.sendCommand(command, this.currentSpeed); };
        const end = (e) => { e.preventDefault(); ws.sendCommand('stop'); };

        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
        
        btn.addEventListener('touchstart', start, {passive: false});
        btn.addEventListener('touchend', end, {passive: false});
    }

    updateMotorStatus(motors) {
        if (!motors) return;
        
        const updateSingle = (elem, state) => {
            elem.textContent = state;
            elem.style.color = state === 'STOP' ? '#aaa' : 
                               state === 'FORWARD' ? 'var(--success)' : 
                               state === 'BACKWARD' ? 'var(--primary)' : '#ff9800';
        };

        updateSingle(this.motorElements.fl, motors.front_left);
        updateSingle(this.motorElements.fr, motors.front_right);
        updateSingle(this.motorElements.bl, motors.back_left);
        updateSingle(this.motorElements.br, motors.back_right);
    }

    resetState() {
        this.updateMotorStatus({
            front_left: 'STOP',
            front_right: 'STOP',
            back_left: 'STOP',
            back_right: 'STOP'
        });
    }
}

const controls = new ControlManager();

// Global wrappers for HTML onclick handlers
window.setMode = function(mode) {
    if (ws.socket) ws.socket.emit('set_mode', { mode: mode });
    if (mode === 'auto') {
        document.getElementById('btn-auto').style.background = 'var(--primary)';
        document.getElementById('btn-auto').style.color = '#fff';
        document.getElementById('btn-manual').style.background = '#0d1117';
        document.getElementById('btn-manual').style.color = 'var(--primary)';
    } else {
        document.getElementById('btn-manual').style.background = 'var(--primary)';
        document.getElementById('btn-manual').style.color = '#fff';
        document.getElementById('btn-auto').style.background = '#0d1117';
        document.getElementById('btn-auto').style.color = 'var(--primary)';
    }
};

window.sendCommand = function(cmd) {
    ws.sendCommand(cmd, controls.currentSpeed);
};

window.changeSpeed = function(val) {
    controls.currentSpeed = parseInt(val);
    document.getElementById('speed-val').textContent = val;
    if (ws.socket) ws.socket.emit('set_speed', { speed: controls.currentSpeed });
};

window.driveDistance = function(dir) {
    let cm = document.getElementById('distance-input').value;
    if (ws.socket) ws.socket.emit('drive_distance', { direction: dir, cm: parseFloat(cm) });
};
