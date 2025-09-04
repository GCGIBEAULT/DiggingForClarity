import os
import json

# Load cityzip.json
with open("data/cityzip.json", "r") as f:
    cityzip = json.load(f)

# Load fallbackZipMap.json
with open("data/fallbackZipMap.json", "r") as f:
    fallback = json.load(f)

# Extract cities from both sources
cities_from_cityzip = list(cityzip.keys())
cities_from_fallback = list(set(fallback.values()))

# Deduplicate and sort
all_cities = sorted(set(cities_from_cityzip + cities_from_fallback))

# Create folders and placeholder files
for city in all_cities:
    folder_path = os.path.join("blocks", city)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, "NationalNews.html")
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(f"""<div class="snippet">
  <strong>{city.title()} Editorial Zone</strong><br>
  Coverage confirmed. Placeholder block live.
</div>
<!-- Injected via fallbackZipMap.json | Placeholder v1 -->
""")

print(f"✅ Created {len(all_cities)} folders with placeholder editorial blocks.")

/* --- STRAY CODE HOLDING ZONE ---
   Cut from live site below copyright
   Fired twice on ZIP input
   Might trigger civic overlay injection

// resolveLocation(zip);
// document.getElementById('zip').addEventListener('input', ...);
// injectFallbackBlock(zip);
*/
 target.innerHTML = `
    <div class="fallback-block">
      <h3>U.S. News Not Found</h3>
      <div class="snippet"><strong>ZIP ${zip} not supported.</strong></div>
      <div class="snippet">Fallback routed to ${city}. Editorial block unavailable.</div>
    </div>`;

  // 🧠 Log unsupported ZIP with weekday
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const fallbackLog = JSON.parse(localStorage.getItem("fallbackZipLog") || "[]");

  fallbackLog.push({
    zip,
    city,
    weekday,
    timestamp: now.toISOString()
  });

  localStorage.setItem("fallbackZipLog", JSON.stringify(fallbackLog));
}

