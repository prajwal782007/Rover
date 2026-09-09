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
