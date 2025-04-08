const db = require('../../data/dbConfig');

async function add(user) {
  const [id] = await db('users').insert(user);
  return db('users').where({ id }).first();
}

module.exports = { add };
