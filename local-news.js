console.log("🟢 local-news.js loaded");

async function loadLocalNews() {
  const container = document.getElementById("local-news");
  container.innerHTML = "<div class='snippet'>Locating and loading news…</div>";

  navigator.geolocation.getCurrentPosition(
    async ({ coords: { latitude, longitude } }) => {
      container.innerHTML = "<div class='snippet'>Fetching local headlines…</div>";
      try {
        const res = await fetch("/.netlify/functions/local-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lon: longitude })
        });
        if (!res.ok) throw new Error(res.statusText);
        const snippets = await res.json();
        container.innerHTML = snippets
          .map(s => `<div class="snippet"><a href="${s.url}" target="_blank">${s.title}</a></div>`)
          .join("");
      } catch (e) {
        console.error("Fetch failed:", e);
        container.innerHTML = "<div class='snippet'>Local news is currently unavailable.</div>";
      }
    },
    err => {
      console.error("Geolocation failed:", err);
      container.innerHTML = "<div class='snippet'>Local news is currently unavailable.</div>";
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("refreshLocalNews");
  if (btn) {
    loadLocalNews();
    btn.addEventListener("click", loadLocalNews);
  }
});
