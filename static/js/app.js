document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Dashboard...");
    
    // Init modules
    cameras.init();
    ws.connect();

    // Setup Telemetry handler
    ws.onTelemetry((data) => {
        if (!data) return;

        // Overwrite camera status from backend with frontend real status
        // Since cameras are independent nodes, frontend img tag is best source of truth for connection
        const camStatus = cameras.getStatus();
        data.connections.camera_left = camStatus.left;
        data.connections.camera_right = camStatus.right;

        // Route data to managers
        ui.updateConnections(data.connections);
        sensors.update(data.telemetry);
        controls.updateMotorStatus(data.motors);
    });
});
