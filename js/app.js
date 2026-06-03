const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|m4v)$/i;
const MEDIA_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|m4v)$/i;

function qs(name){ return new URLSearchParams(location.search).get(name) || ""; }
function cleanSlash(value){ return String(value || "").replace(/^\/+|\/+$/g, ""); }
function joinPath(...parts){ return parts.map(cleanSlash).filter(Boolean).join("/"); }
function encodePath(path){ return cleanSlash(path).split("/").map(encodeURIComponent).join("/"); }
function mediaUrl(path){ return `${MEDIA_BASE_URL.replace(/\/$/, "")}/${encodePath(path)}`; }
function isImage(file){ return IMAGE_EXTENSIONS.test(file); }
function isVideo(file){ return VIDEO_EXTENSIONS.test(file); }
function isMedia(file){ return MEDIA_EXTENSIONS.test(file); }
function folderLabel(name){ return decodeURIComponent(String(name || "")).replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function cleanEventName(name){ return folderLabel(String(name || "").replace(/^\d{4}-\d{2}-\d{2}-?/, "")); }
function formatDate(name){ const m=String(name||"").match(/^(\d{4})-(\d{2})-(\d{2})/); if(!m) return ""; const d=new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}); }
function icon(name){ const n=String(name||"").toLowerCase(); if(n.includes("volleyball"))return"fa-volleyball"; if(n.includes("basketball"))return"fa-basketball"; if(n.includes("baseball")||n.includes("softball"))return"fa-baseball"; if(n.includes("tennis"))return"fa-table-tennis-paddle-ball"; if(n.includes("soccer")||n.includes("football"))return"fa-futbol"; return"fa-camera"; }
function toggleMenu(){ document.getElementById("menu")?.classList.toggle("open"); }
function showEmpty(container, message){ if(container) container.innerHTML = `<p style="color:#9CA3AF;line-height:1.6">${message}</p>`; }

async function listR2(prefix=""){
  const finalPrefix = joinPath(MEDIA_ROOT, prefix);
  const res = await fetch(`/api/list?prefix=${encodeURIComponent(finalPrefix)}`, { cache: "no-store" });
  if(!res.ok) throw new Error("Could not read R2 storage. Check your Pages R2 binding.");
  return res.json();
}

function getFolderName(prefix){ return cleanSlash(prefix).split("/").pop(); }
function getFileName(key){ return cleanSlash(key).split("/").pop(); }

function setGlobalNav(){
  document.querySelectorAll("[data-contact]").forEach(a => a.href = CONTACT_URL);
  document.querySelectorAll("[data-site-title]").forEach(el => el.textContent = SITE_TITLE);
}

async function buildMenu(){
  setGlobalNav();
  const menu = document.getElementById("menuSports");
  if(!menu) return;
  menu.innerHTML = "";
  const root = await listR2("");
  root.folders.forEach(folder => {
    const sport = getFolderName(folder);
    const btn = document.createElement("button");
    btn.textContent = folderLabel(sport);
    btn.onclick = () => location.href = `sport.html?sport=${encodeURIComponent(sport)}`;
    menu.appendChild(btn);
  });
}
