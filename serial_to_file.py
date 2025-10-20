import serial
import time
import re

# --- CONFIG ---
PORT = 'COM4'     # Change if needed
BAUD = 9600
FILE = 'data.txt'

# --- SETUP ---
arduino = serial.Serial(PORT, BAUD, timeout=2)
time.sleep(2)

print("Reading from Arduino...")

while True:
    try:
        line = arduino.readline().decode(errors='ignore').strip()
        if not line:
            continue

        # Extract all numeric values (works even if labels exist)
        numbers = re.findall(r"[-+]?\d*\.\d+|\d+", line)
        if len(numbers) >= 3:
            t, h, d = map(float, numbers[:3])

            data = f"{t},{h},{d}"
            with open(FILE, "w") as f:
                f.write(data)

            print(f"Saved: {data}")

        time.sleep(1)
    except Exception as e:
        print("Error:", e)
        break
