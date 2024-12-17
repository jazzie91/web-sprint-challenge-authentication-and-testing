const db = require('./connection'); 


async function getUserByUsername(username) {
  return db('users').where({ username }).first();
}


async function createUser(user) {
  const [id] = await db('users').insert(user); 
  return db('users').where({ id }).first(); 
}
module.exports = { getUserByUsername, createUser };
