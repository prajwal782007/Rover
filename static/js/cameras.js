class CameraManager {
    constructor() {
        this.feedLeft = document.getElementById('cam-left-feed');
        this.feedRight = document.getElementById('cam-right-feed');
        
        this.cam1Url = ROVER_CONFIG.cam1Url;
        this.cam2Url = ROVER_CONFIG.cam2Url;
        
        this.leftActive = false;
        this.rightActive = false;
    }

    init() {
        if (!ROVER_CONFIG.demoMode) {
            this.loadStream(this.feedLeft, this.cam1Url, 'left');
            this.loadStream(this.feedRight, this.cam2Url, 'right');
        } else {
            this.feedLeft.textContent = 'DEMO MODE - NO CAM';
            this.feedRight.textContent = 'DEMO MODE - NO CAM';
            
            // Fake connection status for demo mode
            this.leftActive = true;
            this.rightActive = true;
        }
    }

    loadStream(container, url, side) {
        if (!url || url === 'None') return;
        
        const img = new Image();
        img.onload = () => {
            container.classList.remove('offline');
            container.textContent = '';
            container.style.backgroundImage = `url('${url}')`;
            if (side === 'left') this.leftActive = true;
            if (side === 'right') this.rightActive = true;
        };
        img.onerror = () => {
            container.classList.add('offline');
            container.textContent = 'Camera Offline';
            container.style.backgroundImage = 'none';
            if (side === 'left') this.leftActive = false;
            if (side === 'right') this.rightActive = false;
        };
        img.src = url;
    }

    // This gets fed back to the UI to update the LEDs
    getStatus() {
        return {
            left: this.leftActive,
            right: this.rightActive
        };
    }
}

const cameras = new CameraManager();
