const express = require('express')
const router = express.Router()
const Trip = require('../models/Trip')
const User = require('../models/User')

/* GET home page. */
router.get('/', async (req, res, next) => {
  let user = await User.find().populate()
  if (user.length >= 3) {
    user.sort((a, b) => (a.accCo2 < b.accCo2) ? 1 : -1)
    user.length=3
  }
  res.render('index', { user })
})

module.exports = router
