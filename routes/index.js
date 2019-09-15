const express = require('express')
const router = express.Router()
const Trip = require('../models/Trip')
const User = require('../models/User')

/* GET home page. */
router.get('/', async (req, res, next) => {
  // let post = await Post.find().populate('postPicture')
  // let createdByArray = []
  // for (let index = 0; index < post.length; index++) {
  //   let curUser = await User.findById(post[index].createdBy).populate()
  //   post[index].clearName = curUser.username
  // }
  //res.render('index', { post, createdByArray })
  res.render('index')
})

module.exports = router
