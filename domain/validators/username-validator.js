function isValidMinecraftUsername(username) {
  if (username.length < 3 || username.length > 40) {
    return false;
  }

  const validChars = /^[a-zA-Z0-9_]+$/;

  if (!validChars.test(username)) {
    return false;
  }

  return true;
}

module.exports = { isValidMinecraftUsername };
