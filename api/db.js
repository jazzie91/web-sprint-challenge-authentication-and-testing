const users = []; 

async function getUserByUsername(username) {
  return users.find(user => user.username === username);
}


async function createUser({ username, password }) {
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);
  return newUser;
}


function resetUsers() {
  users.length = 0; 
}

module.exports = { getUserByUsername, createUser, resetUsers, users };
