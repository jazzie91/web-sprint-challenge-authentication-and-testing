const db = require('../../data/dbConfig')
 
 function findById(userId) {
     return db('users')
     .select('id', 'username', 'password')
     .where('id', userId).first()
   }
 
   async function add(user) {
     const [id] = await db('users').insert(user)
     return findById(id)
   }
 
   function findBy(username) {
     return db('users').where('username', username).first()
   }
   module.exports = {
     add,
     findById,
     findBy
  }