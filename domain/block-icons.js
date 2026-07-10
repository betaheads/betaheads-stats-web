// config/block-sprites.json maps every Bukkit b1.7.3 block material to its
// cell in public/images/items.png; the matching CSS classes live in
// public/block-icons.css (see scripts/generate-block-icons-css.js)
const blockSprites = require('../config/block-sprites.json');

// returns a CSS class like "bh-icon-gold_ore", or null when there is no icon
function getBlockIconClass(material) {
  const name = String(material ?? '').toUpperCase();

  return name in blockSprites ? `bh-icon-${name.toLowerCase()}` : null;
}

module.exports = { getBlockIconClass };
