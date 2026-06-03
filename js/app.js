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
    .map(encodeURIComponent)
    .join("/");
}

function mediaUrl(...parts) {
  const path = joinPath(MEDIA_ROOT, ...parts);
  return `${MEDIA_BASE_URL.replace(/\/$/, "")}/${encodePath(path)}`;
}

async function loadData() {
  const response = await fetch("data.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Could not load data.json");
  }

  return response.json();
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

function formatDate(value) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

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

  container.innerHTML = `<p style="color:#9CA3AF;line-height:1.6">${message}</p>`;
}

function findSport(data, sportSlug) {
  return (data.sports || []).find(sport => sport.slug === sportSlug);
}

function findTeam(sport, teamSlug) {
  return (sport?.teams || []).find(team => team.slug === teamSlug);
}

function findEvent(team, eventSlug) {
  return (team?.events || []).find(event => event.slug === eventSlug);
}

function eventFolder(sport, team, event) {
  return joinPath(sport.slug, team.slug, event.slug);
}

function eventFileUrl(sport, team, event, filename) {
  return mediaUrl(eventFolder(sport, team, event), filename);
}

function setGlobalNav(data = null) {
  const title = data?.site?.title || SITE_TITLE;
  const contactUrl = data?.site?.contactUrl || CONTACT_URL;

  document.querySelectorAll("[data-site-title]").forEach(element => {
    element.textContent = title;
  });

  document.querySelectorAll("[data-contact]").forEach(anchor => {
    anchor.href = contactUrl;
  });
}

function buildMenu(data) {
  setGlobalNav(data);

  const menu = document.getElementById("menuSports");
  if (!menu) return;

  menu.innerHTML = "";

  (data.sports || []).forEach(sport => {
    const button = document.createElement("button");
    button.textContent = sport.name;
    button.onclick = () => {
      location.href = `sport.html?sport=${encodeURIComponent(sport.slug)}`;
    };

    menu.appendChild(button);
  });
}
