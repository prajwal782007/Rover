class SensorManager {
    constructor() {
        // Odometry / MPU
        this.posX = document.getElementById('pos-x');
        this.posY = document.getElementById('pos-y');
        this.posDisp = document.getElementById('pos-disp');
        this.heading = document.getElementById('heading-angle');
        this.temp = document.getElementById('temp-val');
        
        // LiDAR
        this.lidarDist = document.getElementById('lidar-distance');
        this.lidarFill = document.getElementById('lidar-fill');
        this.lidarStatus = document.getElementById('lidar-sensor-status');
    }

    update(telemetry) {
        if (!telemetry) return;

        // Odometry
        if (telemetry.x !== undefined) this.posX.textContent = telemetry.x.toFixed(1);
        if (telemetry.y !== undefined) this.posY.textContent = telemetry.y.toFixed(1);
        if (telemetry.disp !== undefined) this.posDisp.textContent = telemetry.disp.toFixed(1);
        if (telemetry.heading !== undefined) this.heading.textContent = telemetry.heading.toFixed(1);
        if (telemetry.temp !== undefined) this.temp.textContent = telemetry.temp.toFixed(1);

        // LiDAR
        if (telemetry.lidar !== undefined) {
            const dist = telemetry.lidar;
            this.lidarDist.textContent = dist;
            
            if (dist > 0) {
                this.lidarStatus.textContent = 'CONNECTED';
                this.lidarStatus.style.color = 'var(--success)';
                
                // Visual bar (assuming max 200cm for visual scale)
                let pct = Math.min((dist / 200) * 100, 100);
                this.lidarFill.style.width = pct + '%';
                
                if (dist < 20) {
                    this.lidarFill.style.background = 'var(--danger)';
                } else if (dist < 50) {
                    this.lidarFill.style.background = '#ff9800';
                } else {
                    this.lidarFill.style.background = 'var(--success)';
                }
            } else {
                this.lidarStatus.textContent = 'NO DATA / OFFLINE';
                this.lidarStatus.style.color = 'var(--danger)';
                this.lidarFill.style.width = '0%';
            }
        }
    }
}

const sensors = new SensorManager();
