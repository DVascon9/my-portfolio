const fs = require("fs");
const path = require("path");

const baseDir = process.argv[2] || "./galleries";
const outputFile = process.argv[3] || "data.json";
const mediaExtensions = /\.(jpg|jpeg|png|webp|gif|mp4|mov|webm|m4v)$/i;

function titleFromSlug(slug) {
  return String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

function eventTitleFromSlug(slug) {
  return titleFromSlug(String(slug || "").replace(/^\d{4}-\d{2}-\d{2}-?/, ""));
}

function dateFromSlug(slug) {
  const match = String(slug || "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function readFolders(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory)
    .filter(item => fs.statSync(path.join(directory, item)).isDirectory())
    .sort();
}

function readMediaFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory)
    .filter(file => mediaExtensions.test(file))
    .sort();
}

const data = {
  site: {
    title: "DVascon Productions",
    logoUrl: "assets/DVascon_Productions_Logo.png",
    heroImageUrl: "assets/BG_Website.jpg",
    contactUrl: "https://dot.cards/dvascon_productions"
  },
  sports: []
};

for (const sportSlug of readFolders(baseDir)) {
  const sportPath = path.join(baseDir, sportSlug);
  const sport = {
    name: titleFromSlug(sportSlug),
    slug: sportSlug,
    teams: []
  };

  for (const teamSlug of readFolders(sportPath)) {
    const teamPath = path.join(sportPath, teamSlug);
    const team = {
      name: titleFromSlug(teamSlug),
      slug: teamSlug,
      events: []
    };

    for (const eventSlug of readFolders(teamPath)) {
      const eventPath = path.join(teamPath, eventSlug);
      const files = readMediaFiles(eventPath);
      const cover = files.find(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file)) || files[0] || "";

      team.events.push({
        title: eventTitleFromSlug(eventSlug),
        slug: eventSlug,
        date: dateFromSlug(eventSlug),
        cover,
        files
      });
    }

    sport.teams.push(team);
  }

  data.sports.push(sport);
}

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log(`✅ ${outputFile} generated from ${baseDir}`);
