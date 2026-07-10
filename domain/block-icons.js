const fs = require('fs');
const path = require('path');

// public/images/blocks/<bukkit_material_lowercase>.png,
// generated from 1.8.8-era textures (closest to the beta look)
const ICONS_DIR = path.resolve(__dirname, '../public/images/blocks');

const availableIcons = new Set(
  fs.existsSync(ICONS_DIR)
    ? fs
        .readdirSync(ICONS_DIR)
        .filter((file) => file.endsWith('.png'))
        .map((file) => file.slice(0, -'.png'.length))
    : []
);

// returns a path relative to basePath, or null when there is no icon
function getBlockIconUrl(material) {
  const name = String(material ?? '').toLowerCase();

  return availableIcons.has(name) ? `/static/images/blocks/${name}.png` : null;
}

module.exports = { getBlockIconUrl };
