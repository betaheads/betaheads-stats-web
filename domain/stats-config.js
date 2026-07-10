// Statistic definitions collected by the betaheads-stats plugin.
// config/actions.json is a verbatim copy of actions.json from the plugin repo,
// update it from there when new statistics are added.
const actions = require('../config/actions.json');

const blockActions = actions.block_actions;
const activityTypes = actions.activity_types;
const activities = actions.activities;
const userFields = actions.user_fields;

function getActivitiesByType(typeName) {
  return activities.filter((activity) => activity.type === typeName);
}

// [{ name, title, activities: [{ name, type, title, unit }] }]
function getActivityGroups() {
  return activityTypes.map((type) => ({
    name: type.name,
    title: type.title,
    activities: getActivitiesByType(type.name),
  }));
}

module.exports = { blockActions, activityTypes, activities, userFields, getActivitiesByType, getActivityGroups };
