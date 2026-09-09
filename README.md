# ESP32 Rover Control Dashboard

A complete, modular web-based control and monitoring dashboard for an ESP32-based rover.

## Project Structure
```
rover/
├── app.py                     # Main Flask application entry point
├── config.py                  # Central configuration (IPs, Ports, timeouts)
├── requirements.txt           # Python dependencies
├── README.md
├── backend/
│   ├── __init__.py
│   ├── esp32_handler.py       # Handles HTTP requests to the physical ESP32
│   ├── websocket_handler.py   # Handles real-time Socket.IO communication
│   └── rover_state.py         # Thread-safe central state manager
├── templates/
│   └── index.html             # Main dashboard UI
├── static/
│   ├── css/
│   │   └── style.css          # Vanilla CSS styling
│   └── js/
│       ├── app.js             # Frontend initialization
│       ├── websocket.js       # Frontend WebSocket manager
│       ├── controls.js        # Motor and directional controls
│       ├── sensors.js         # MPU6050 and LiDAR UI updates
│       ├── cameras.js         # ESP32-CAM stream management
│       └── ui.js              # General UI indicators
└── tests/
    └── test_connection.py     # Unit tests for state management
```

## Installation

1. Open your terminal in the `rover` directory.
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Edit `config.py` to change settings before connecting the physical rover:

- `ESP32_HOST`: The IP address of your main ESP32 (e.g., `192.168.1.100`)
- `ESP32_PORT`: The HTTP port of the ESP32 (default `80`)
- `CAMERA_1_URL`: URL of the Left ESP32-CAM (e.g., `http://192.168.1.101:81/stream`)
- `CAMERA_2_URL`: URL of the Right ESP32-CAM (e.g., `http://192.168.1.102:81/stream`)
- `DEMO_MODE`: Set to `False` when ready to control the physical rover. Set to `True` for UI testing.

**Note:** The ESP32 and this backend must be on the same Wi-Fi network (Galaxy M30s26CE).

## Running the Server

1. Ensure the virtual environment is active.
2. Run the application:
   ```bash
   python app.py
   ```
3. Open your browser and navigate to:
   [http://localhost:5000](http://localhost:5000)

## How it Works

1. **Frontend to Backend**: The browser connects to the Flask backend via WebSockets (`Socket.IO`). When you press a directional button, a JSON message (e.g., `{command: "forward", speed: 200}`) is sent via WebSocket to the server.
2. **Backend to ESP32**: The `esp32_handler.py` translates this WebSocket command into an HTTP REST request (e.g., `GET /move?direction=forward`) and sends it to the physical ESP32.
3. **ESP32 to Backend**: The backend continuously polls `GET /sensor` on the ESP32 to retrieve the latest Odometry, Heading, and LiDAR data.
4. **Backend to Frontend**: The backend broadcasts the merged `rover_state` to all connected browser clients via WebSocket every 300ms, updating the UI smoothly.
5. **Cameras**: Camera feeds are loaded directly in the browser via `<img>` tags pointing to the ESP32-CAM stream URLs.

## Troubleshooting

- **ESP32 Offline**: Verify the IP address in `config.py` matches the ESP32's assigned IP.
- **WebSocket Disconnected**: Ensure the Flask server is running and there are no firewall issues blocking port 5000.
- **Motors don't stop on disconnect**: The backend has a fallback in `websocket_handler.py` to issue a STOP command if the client disconnects.
