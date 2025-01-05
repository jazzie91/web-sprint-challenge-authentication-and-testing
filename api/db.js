const bcrypt = require('bcrypt');
const db = require('./db');

const users = [];

async function getUserByUsername(username) {
  return users.find(user => user.username === username) || null;
}

async function createUser({ username, password }) {
  
  const hashedPassword = await bcrypt.hash(password, 10);

  
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  
  try {
    const [dbUser] = await db('users').insert({ username, password: hashedPassword }).returning('*');
    return dbUser;
  } catch (error) {
    console.error('Error saving user to the database:', error);
    throw error; 
  }
}

 
function resetUsers() {
  users.length = 0;
}

module.exports = { getUserByUsername, createUser, resetUsers };
