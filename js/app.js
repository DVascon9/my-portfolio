const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|m4v)$/i;
const MEDIA_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|m4v)$/i;

function qs(name) {
  return new URLSearchParams(location.search).get(name) || "";
}

function cleanSlash(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function joinPath(...parts) {
  return parts.map(cleanSlash).filter(Boolean).join("/");
}

function encodePath(path) {
  return cleanSlash(path)
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

function mediaUrl(path) {
  const rootAndPath = joinPath(MEDIA_ROOT, path);
  return `${MEDIA_BASE_URL.replace(/\/$/, "")}/${encodePath(rootAndPath)}`;
}

function isImage(file) {
  return IMAGE_EXTENSIONS.test(file);
}

function isVideo(file) {
  return VIDEO_EXTENSIONS.test(file);
}

function isMedia(file) {
  return MEDIA_EXTENSIONS.test(file);
}

function folderLabel(name) {
  return decodeURIComponent(String(name || ""))
    .replace(/-/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

function cleanEventName(name) {
  return folderLabel(String(name || "").replace(/^\d{4}-\d{2}-\d{2}-?/, ""));
}

function formatDate(name) {
  const match = String(name || "").match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return "";

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function icon(name) {
  const normalized = String(name || "").toLowerCase();

  if (normalized.includes("volleyball")) return "fa-volleyball";
  if (normalized.includes("basketball")) return "fa-basketball";
  if (normalized.includes("baseball") || normalized.includes("softball")) return "fa-baseball";
  if (normalized.includes("tennis")) return "fa-table-tennis-paddle-ball";
  if (normalized.includes("soccer") || normalized.includes("football")) return "fa-futbol";

  return "fa-camera";
}

function toggleMenu() {
  document.getElementById("menu")?.classList.toggle("open");
}

function showEmpty(container, message) {
  if (!container) return;

  container.innerHTML = `
    <p style="color:#9CA3AF;line-height:1.6">
      ${message}
    </p>
  `;
}

function showLoading(container, message = "Loading...") {
  if (!container) return;

  container.innerHTML = `
    <p style="color:#9CA3AF;line-height:1.6">
      ${message}
    </p>
  `;
}

async function listR2(prefix = "") {
  const finalPrefix = joinPath(MEDIA_ROOT, prefix);
  const response = await fetch(`/api/list?prefix=${encodeURIComponent(finalPrefix)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not read R2 storage. Check the GALLERIES R2 binding.");
  }

  return response.json();
}

function getFolderName(prefix) {
  return cleanSlash(prefix).split("/").pop();
}

function setGlobalNav() {
  document.querySelectorAll("[data-contact]").forEach(link => {
    link.href = CONTACT_URL;
  });

  document.querySelectorAll("[data-site-title]").forEach(element => {
    element.textContent = SITE_TITLE;
  });
}

async function buildMenu() {
  setGlobalNav();

  const menu = document.getElementById("menuSports");
  if (!menu) return;

  menu.innerHTML = "";

  const root = await listR2("");

  root.folders.forEach(folder => {
    const sport = getFolderName(folder);
    const button = document.createElement("button");

    button.textContent = folderLabel(sport);
    button.onclick = () => {
      location.href = `sport.html?sport=${encodeURIComponent(sport)}`;
    };

    menu.appendChild(button);
  });
}
