import os
import json

print("Running from:", os.getcwd())  # Optional debug

# Load cityzip.json
with open("../data/cityzip.json", "r", encoding="utf-8") as f:
    cityzip = json.load(f)  # ← This line is missing in your current script

# Loop through each city name
for city in cityzip:
    folder_path = os.path.join('data', city)
    os.makedirs(folder_path, exist_ok=True)
    with open(os.path.join(folder_path, 'index.html'), 'w') as placeholder:
        placeholder.write(f'<!-- Placeholder for {city} -->')

