import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

# This is the front door of your Gateway Router
GATEWAY_URL = "http://localhost:8000/route"

def send_to_swarm(task_type, payload_data):
    print(f"\n🚀 Sending a '{task_type}' task to the Swarm...")
    
    # We package our data exactly how the Gateway expects it
    data_packet = {
        "task_type": task_type,
        "payload": payload_data
    }
    
    # We fire the data packet at the Gateway
    response = requests.post(GATEWAY_URL, json=data_packet)
    
    # Print the beautiful result
    print("📥 Response received:")
    print(json.dumps(response.json(), indent=2))

# --- TEST 1: The Text Specialist ---
text_data = {"sentence": "Hello world! My Swarmio Engine is officially alive and routing traffic."}
send_to_swarm("text", text_data)

# --- TEST 2: The Math Specialist ---
math_data = {"numbers": [42, 108, 7, 999, 23]}
send_to_swarm("math", math_data)