import os

class Config:
    # Flask & SocketIO Settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-key')
    PORT = int(os.environ.get('PORT', 5000))

    # ESP32 Configuration
    ESP32_HOST = os.environ.get('ESP32_HOST', '192.168.115.219')
    ESP32_PORT = int(os.environ.get('ESP32_PORT', 80))
    ESP32_URL = f"http://{ESP32_HOST}:{ESP32_PORT}"

    # Camera URLs (Independent ESP32-CAM nodes)
    CAMERA_1_URL = os.environ.get('CAMERA_1_URL', 'http://192.168.1.101:81/stream')
    CAMERA_2_URL = os.environ.get('CAMERA_2_URL', 'http://192.168.1.102:81/stream')

    # Motor Settings
    DEFAULT_SPEED = 200
    MOTOR_COMMAND_TIMEOUT = 2.0  # seconds

    # Development / Demo Mode
    # If True, generates simulated sensor data and doesn't send HTTP requests to real ESP32
    DEMO_MODE = os.environ.get('DEMO_MODE', 'False').lower() == 'true'
