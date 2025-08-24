import json
import os

read_path = 'data/abilene/news.json'
write_path = 'data/abilene/test_output.json'

try:
    # Read test
    if os.path.exists(read_path):
        with open(read_path, 'r') as f:
            data = json.load(f)
            print("✅ Read successful:", data)
    else:
        print("⚠️ news.json not found at", read_path)

    # Write test
    test_data = {"status": "Write test successful"}
    with open(write_path, 'w') as f:
        json.dump(test_data, f)
        print("✅ Write successful:", write_path)

except Exception as e:
    print("❌ Error:", e)
