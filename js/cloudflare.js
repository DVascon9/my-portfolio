/* Dvascon Productions — Cloudflare/R2 helper
   Replace this URL with your Cloudflare R2 public URL or custom media domain.
   No trailing slash.
*/
const CLOUDFLARE_MEDIA_BASE_URL = "https://pub-bb48dd8ef8384549aefb7bc416b48fac.r2.dev";

const MEDIA_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|m4v)$/i;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|m4v)$/i;

async function loadGalleryData() {
  const response = await fetch("data.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load data.json");
  return response.json();
}

function encodePath(path) {
  return String(path)
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");
}

function mediaUrl(path) {
  if (!CLOUDFLARE_MEDIA_BASE_URL || CLOUDFLARE_MEDIA_BASE_URL.includes("YOUR-CLOUDFLARE")) {
    console.warn("Set CLOUDFLARE_MEDIA_BASE_URL in js/cloudflare.js");
  }
  return `${CLOUDFLARE_MEDIA_BASE_URL}/${encodePath(path)}`;
}

function getSports(data) {
  return Object.keys(data || {}).sort();
}

function getTeams(data, sport) {
  return Object.keys((data || {})[sport] || {}).sort();
}

function getEvents(data, sport, team) {
  return Object.keys(((data || {})[sport] || {})[team] || {}).sort().reverse();
}

function getMedia(data, sport, team, event) {
  return ((((data || {})[sport] || {})[team] || {})[event] || [])
    .filter(file => MEDIA_EXTENSIONS.test(file));
}

function isImage(file) {
  return IMAGE_EXTENSIONS.test(file);
}

function isVideo(file) {
  return VIDEO_EXTENSIONS.test(file);
}

function icon(name){
  name = String(name || "").toLowerCase();
  if(name.includes("volleyball")) return "fa-volleyball";
  if(name.includes("basketball")) return "fa-basketball";
  if(name.includes("baseball") || name.includes("softball")) return "fa-baseball";
  if(name.includes("tennis")) return "fa-table-tennis-paddle-ball";
  if(name.includes("soccer") || name.includes("football")) return "fa-futbol";
  return "fa-camera";
}

function formatDate(name) {
  const match = String(name || "").match(/^(\d{2})-(\d{2})-(\d{2})/);
  if (!match) return "";
  const [, mm, dd, yy] = match;
  return new Date(`20${yy}-${mm}-${dd}`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function cleanEventName(name) {
  return String(name || "").replace(/^\d{2}-\d{2}-\d{2}/, "").trim() || name;
}

function toggleMenu(){
  document.getElementById("menu")?.classList.toggle("open");
}

function showEmpty(container, message) {
  if (!container) return;
  container.innerHTML = `<p style="color:#9CA3AF;line-height:1.6">${message}</p>`;
}
