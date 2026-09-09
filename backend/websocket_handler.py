from flask_socketio import SocketIO, emit
import threading
import time
from backend.rover_state import rover_state
from backend.esp32_handler import esp32_handler

socketio = SocketIO(cors_allowed_origins="*")
_broadcast_thread = None
_thread_lock = threading.Lock()
_broadcast_running = False

def background_thread():
    """Background task that pushes telemetry to connected clients."""
    global _broadcast_running
    while _broadcast_running:
        socketio.sleep(0.3) # Match physical ESP32 update rate
        state = rover_state.get_full_state()
        socketio.emit('telemetry_update', state)

@socketio.on('connect')
def handle_connect():
    global _broadcast_thread, _broadcast_running
    print("Client connected")
    with _thread_lock:
        if _broadcast_thread is None:
            _broadcast_running = True
            _broadcast_thread = socketio.start_background_task(background_thread)
    
    emit('telemetry_update', rover_state.get_full_state())

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")
    # We could stop motors here as a safety precaution if no clients are connected
    esp32_handler.send_command("stop")
    rover_state.set_motor_state("stop")

@socketio.on('motor_command')
def handle_motor_command(data):
    command = data.get('command', 'stop')
    speed = data.get('speed', None)
    
    # Send to physical ESP32
    success = esp32_handler.send_command(command, speed)
    
    # Update local state
    if success or True: # update state regardless for UI feedback in demo
        rover_state.set_motor_state(command, speed)
