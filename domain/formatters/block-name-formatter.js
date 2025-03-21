function toReadableName(str) {
  let name = str;

  name = name.replace(/_/g, ' ');

  name = capitalizeWords(name);

  return name;
}

function capitalizeWords(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = { toReadableName };
