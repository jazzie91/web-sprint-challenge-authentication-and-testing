const express = require("express")
const bcrypt = require ('bcryptjs')
const router = express.Router()


router.post("/register", async (req, res, next) => {
  try {
  const {username, password} = req.body
  const hash = bcrypt.hashSync(password, 8)
  const newUser = { username, password: hash }
  const access = await  user.add(newUser)
    res.status(201).json({
      message: `register working, ${access.username}`
    })
    } catch (err) {
      next(err)
    }
  })
 

router.post("/login", async (req, res, next) => {
  try{
    const {username, password} = req.body
    const [user] = await user. findBy({ username })
    if ( user && bcryptjs.compareSync(password, user.password)) {
    } else {
      next ({ status: 401, message: 'bad credentials'})
    }
  } catch (err) {
    next(err)
  }
  })
  

router.get("/logout", async (req, res, next) => {
  if (req.session.user) {
    const { username } = req.session.user
    req.session.destroy(err => {
      if (err) {
        res.json({ message: `try again, ${username}`})
      } else {
        res.set('Set-Cookie', 'knuckles=; SameSite=Strict; Path=/; Expires=Thu, 20 Mar 2025 00:00:00')
        res.json({ message: `goodbye, ${username}`})
      }
    })
  } else {
  res.json({ message: 'access denied'})
  }
  })
 


module.exports = router;
