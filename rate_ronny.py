#!/usr/bin/env python3
import base64, json, os, subprocess, requests

# Get xAI key from 1Password
key = subprocess.run(
    ["/opt/data/bin/op", "read", "op://Rip Vault/xAI API Key/credential"],
    capture_output=True, text=True
).stdout.strip()

# Read and encode image
with open("/opt/data/cache/images/img_e4af504f8bd9.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

print(f"Image: {len(b64)} bytes encoded")

# Also check for the first image
try:
    with open("/opt/data/cache/images/img_6874b0c99760.jpg", "rb") as f:
        b64_2 = base64.b64encode(f.read()).decode()
    print(f"Chad+ZPS image: {len(b64_2)} bytes encoded")
except:
    print("No Chad+ZPS image found")

# Call xAI Grok vision API
resp = requests.post(
    "https://api.x.ai/v1/chat/completions",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}"
    },
    json={
        "model": "grok-vision-2",
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Rate this guy's golf drip, vibe, and overall appearance like you are a Scottish links fashion critic serving as a judge for LIST Golf Scotland 2026 Championship. This is Ronny Hise. He just shot a personal best 86 at The Old Course. Be honest, funny, and brutal in the way only a Scottish golf course pub review can be. Give a numerical rating out of 10 for: (1) Golf Drip / Style, (2) Vibe / Energy, (3) Post-Round Pub Presence. Then give an overall LIST Golf rating. Write it like a proper Scottish golf pub review."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{b64}"
                    }
                }
            ]
        }],
        "max_tokens": 800
    },
    timeout=30
)

print(f"\nStatus: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(data['choices'][0]['message']['content'])
else:
    print(f"Error: {resp.text}")