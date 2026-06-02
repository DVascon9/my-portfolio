function qs(name){ return new URLSearchParams(location.search).get(name); }

async function loadData(){
  const res = await fetch('data.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('Could not load data.json');
  return res.json();
}

function joinPath(...parts){
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

function mediaUrl(...parts){
  const path = joinPath(MEDIA_ROOT, ...parts).split('/').map(encodeURIComponent).join('/');
  return `${MEDIA_BASE_URL.replace(/\/$/, '')}/${path}`;
}

function eventFolder(sport, team, event){
  return joinPath(sport.slug, team.slug, event.slug);
}

function eventFileUrl(sport, team, event, filename){
  return mediaUrl(eventFolder(sport, team, event), filename);
}

function formatDate(value){
  if(!value) return '';
  const d = new Date(`${value}T00:00:00Z`);
  if(Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', timeZone:'UTC' });
}

function icon(name){
  const n = name.toLowerCase();
  if(n.includes('volleyball')) return 'fa-volleyball';
  if(n.includes('basketball')) return 'fa-basketball';
  if(n.includes('baseball') || n.includes('softball')) return 'fa-baseball';
  if(n.includes('soccer') || n.includes('football')) return 'fa-futbol';
  return 'fa-camera';
}

function buildNav(data){
  const logo = document.querySelector('[data-logo]');
  const siteTitle = document.querySelector('[data-site-title]');
  const menuSports = document.getElementById('menuSports');
  const contactLinks = document.querySelectorAll('[data-contact]');

  if(logo && data.site.logoUrl) logo.src = data.site.logoUrl;
  if(siteTitle) siteTitle.textContent = data.site.title || 'Dvascon Productions';
  contactLinks.forEach(a => a.href = data.site.contactUrl || '#');

  if(menuSports){
    menuSports.innerHTML = '';
    data.sports.forEach(sport => {
      const btn = document.createElement('button');
      btn.textContent = sport.name;
      btn.className = 'menu-animate';
      btn.onclick = () => location.href = `sport.html?sport=${encodeURIComponent(sport.slug)}`;
      menuSports.appendChild(btn);
    });
  }
}

function toggleMenu(){
  document.getElementById('menu')?.classList.toggle('open');
}
