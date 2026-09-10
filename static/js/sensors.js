class SensorManager {
    constructor() {
        // Odometry / MPU
        this.posX = document.getElementById('pos-x');
        this.posY = document.getElementById('pos-y');
        this.posDisp = document.getElementById('pos-disp');
        this.heading = document.getElementById('heading-angle');
        
        // LiDAR
        this.lidarDist = document.getElementById('lidar-distance');
        this.lidarFill = document.getElementById('lidar-fill');
        this.lidarStatus = document.getElementById('lidar-sensor-status');
        this.obsStatus = document.getElementById('obs-status');

        // Trajectory Canvas
        this.canvas = document.getElementById('trajectory-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.pathPoints = [];
        }
    }

    update(telemetry) {
        if (!telemetry) return;

        // Odometry
        if (telemetry.x !== undefined) this.posX.textContent = telemetry.x.toFixed(1);
        if (telemetry.y !== undefined) this.posY.textContent = telemetry.y.toFixed(1);
        if (telemetry.disp !== undefined) this.posDisp.textContent = telemetry.disp.toFixed(1);
        if (telemetry.heading !== undefined) this.heading.textContent = telemetry.heading.toFixed(1);

        // LiDAR
        if (telemetry.lidar !== undefined) {
            this.lidarDist.textContent = telemetry.lidar;
            
            if (telemetry.lidar > 0) {
                this.lidarStatus.textContent = 'CONNECTED';
                this.lidarStatus.style.color = 'var(--success)';
                
                // Update fill bar
                const maxDist = 400; // 4 meters max typical
                const pct = Math.min((telemetry.lidar / maxDist) * 100, 100);
                this.lidarFill.style.width = `${pct}%`;
                
                // Obstacle Status matching ESP32 (< 25 cm)
                if (telemetry.lidar < 25) {
                    this.obsStatus.textContent = "OBSTACLE DETECTED";
                    this.obsStatus.style.color = "var(--danger)";
                    this.lidarFill.style.backgroundColor = 'var(--danger)';
                } else {
                    this.obsStatus.textContent = "CLEAR";
                    this.obsStatus.style.color = "var(--success)";
                    this.lidarFill.style.backgroundColor = 'var(--primary)';
                }
            } else {
                this.lidarStatus.textContent = 'NO DATA / OFFLINE';
                this.lidarStatus.style.color = 'var(--danger)';
                this.lidarFill.style.width = '0%';
                this.obsStatus.textContent = "UNKNOWN";
                this.obsStatus.style.color = "#888";
            }
        }

        // Update Trajectory Map
        if (telemetry.x !== undefined && telemetry.y !== undefined && this.canvas) {
            this.drawTrajectory(telemetry.x, telemetry.y);
        }
    }

    drawTrajectory(x, y) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        // Draw grid background
        ctx.strokeStyle = "rgba(33, 150, 243, 0.1)"; // faint blue grid
        ctx.lineWidth = 1;
        for(let i = 0; i < width; i += 30) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
        }
        for(let i = 0; i < height; i += 30) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        // Map rover coordinates to canvas center
        // Tweak multiplier to zoom in/out
        let cx = width / 2 + (x * 0.8);
        let cy = height / 2 - (y * 0.8);

        // Store path points
        this.pathPoints.push({x: cx, y: cy});
        if(this.pathPoints.length > 150) this.pathPoints.shift(); // keep last 150 points

        // Draw path line
        if(this.pathPoints.length > 1) {
            ctx.strokeStyle = "#ff9800"; // Orange path
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
            for(let p of this.pathPoints) { 
                ctx.lineTo(p.x, p.y); 
            }
            ctx.stroke();
        }

        // Draw rover position blip
        ctx.fillStyle = "var(--success)"; // Green blip
        ctx.beginPath(); 
        ctx.arc(cx, cy, 4, 0, Math.PI * 2); 
        ctx.fill();
    }
}

const sensors = new SensorManager();
