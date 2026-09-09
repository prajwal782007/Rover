from flask import Flask, render_template, jsonify
from config import Config
from backend.websocket_handler import socketio
from backend.esp32_handler import esp32_handler
from backend.rover_state import rover_state

app = Flask(__name__)
app.config.from_object(Config)

# Initialize SocketIO
socketio.init_app(app)

@app.route('/')
def index():
    """Serve the main dashboard"""
    return render_template('index.html', config={
        'demo_mode': Config.DEMO_MODE,
        'cam1': Config.CAMERA_1_URL,
        'cam2': Config.CAMERA_2_URL,
    })

# REST API Endpoints
@app.route('/api/status')
def api_status():
    state = rover_state.get_full_state()
    return jsonify(state["connections"])

@app.route('/api/sensors')
def api_sensors():
    state = rover_state.get_full_state()
    return jsonify(state["telemetry"])

@app.route('/api/motors')
def api_motors():
    state = rover_state.get_full_state()
    return jsonify(state["motors"])

if __name__ == '__main__':
    print("Starting ESP32 Background Handler...")
    esp32_handler.start()
    
    try:
        print(f"Starting Flask-SocketIO server on port {Config.PORT}...")
        socketio.run(app, host='0.0.0.0', port=Config.PORT, debug=False, allow_unsafe_werkzeug=True)
    finally:
        esp32_handler.stop()
