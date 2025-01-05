const bcrypt = require('bcrypt'); 
const db = require('./db'); 

const users = []; 

async function getUserByUsername(username) {
  return users.find(user => user.username === username);
}

async function createUser({ username, password }) {
  
  const hashedPassword = await bcrypt.hash(password, 10);

  
  const [newUser] = await db('users').insert({ username, password: hashedPassword }).returning('*');
  return newUser;
}

function resetUsers() {
  users.length = 0; 
}

module.exports = { getUserByUsername, createUser, resetUsers };
