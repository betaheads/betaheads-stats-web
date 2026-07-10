const { getDistinctBlocksData } = require('../db/repository');
const { getBlockIconClass } = require('./block-icons');
const { toReadableName } = require('./formatters/block-name-formatter');
const { activities, activityTypes, userFields } = require('./stats-config');
const { cachedByKey } = require('./ttl-cache');

const BLOCKS_CACHE_TTL_MS = 10 * 60 * 1000;

const getDistinctBlocks = cachedByKey(BLOCKS_CACHE_TTL_MS, getDistinctBlocksData);

// "Total blocks placed" -> "Total-blocks-placed"
function titleToSlug(title) {
  return title.trim().replace(/\s+/g, '-');
}

function userFieldCategory(fieldName, title) {
  const field = userFields.find((f) => f.name === fieldName);

  return {
    slug: titleToSlug(title),
    title,
    kind: 'user_field',
    params: { field: fieldName },
    unit: field?.unit,
  };
}

// Grouped list of every category players can be ranked by:
// user fields, block totals, per-block break/place counts and all activities.
async function getCategoryGroups() {
  const blocks = await getDistinctBlocks();

  const groups = [];

  groups.push({
    title: 'Players',
    items: [userFieldCategory('played_ms', 'Total playtime'), userFieldCategory('login_count', 'Logins count')],
  });

  const blockItems = [
    {
      slug: titleToSlug('Total blocks placed'),
      title: 'Total blocks placed',
      kind: 'block_total',
      params: { action: 'PLACE' },
    },
    {
      slug: titleToSlug('Total blocks broken'),
      title: 'Total blocks broken',
      kind: 'block_total',
      params: { action: 'BREAK' },
    },
  ];

  blocks.forEach((block) => {
    const readableBlock = toReadableName(block);
    const iconClass = getBlockIconClass(block);

    blockItems.push({
      slug: titleToSlug(`${readableBlock} placed`),
      title: `${readableBlock} placed`,
      kind: 'block',
      params: { block, action: 'PLACE' },
      iconClass,
    });

    blockItems.push({
      slug: titleToSlug(`${readableBlock} broken`),
      title: `${readableBlock} broken`,
      kind: 'block',
      params: { block, action: 'BREAK' },
      iconClass,
    });
  });

  groups.push({ title: 'Block statistics', items: blockItems });

  activityTypes.forEach((type) => {
    groups.push({
      title: type.title,
      items: activities
        .filter((activity) => activity.type === type.name)
        .map((activity) => ({
          slug: titleToSlug(activity.title),
          title: activity.title,
          kind: 'activity',
          params: { activity: activity.name },
          unit: activity.unit,
        })),
    });
  });

  return groups;
}

async function findCategoryBySlug(slug) {
  const groups = await getCategoryGroups();
  const normalizedSlug = String(slug).toLowerCase();

  for (const group of groups) {
    const category = group.items.find((item) => item.slug.toLowerCase() === normalizedSlug);

    if (category) {
      return category;
    }
  }

  return null;
}

module.exports = { getCategoryGroups, findCategoryBySlug };
