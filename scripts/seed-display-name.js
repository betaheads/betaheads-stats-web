const db = require('../db/database');
const axios = require('axios');

const url = 'https://api.mojang.com/users/profiles/minecraft/';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedDisplayNames() {
  const [users] = await db.query('SELECT name FROM users');

  const displayNames = [];

  for (const user of users) {
    await sleep(2164);
    console.log(user.name);

    try {
      const res = await axios.get(url + user.name);

      const displayName = res.data.name;

      await db.query('UPDATE users SET display_name = ? WHERE name = ?', [displayName, user.name]);

      displayNames.push(displayName);
    } catch (error) {
      console.log(error.status);
    }
  }

  console.log(displayNames);
}

seedDisplayNames();
