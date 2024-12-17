const users = [];

async function getUserByUsername(username) {
  return users.find(user => user.username === username);
}

async function createUser({ username, password }) {
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  return newUser;
}

module.exports = { getUserByUsername, createUser };
// 