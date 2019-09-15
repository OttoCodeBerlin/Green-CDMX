const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const Trip = require('../models/Trip')
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login')

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('secure/login', { message: req.flash('error') })
})

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

router.get('/signup', ensureLoggedOut(), (req, res) => {
  res.render('secure/signup', { message: req.flash('error') })
})

router.post(
  '/signup',
  ensureLoggedOut(),
  passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  })
)

router.get('/profile', ensureLoggedIn('/login'), async function(req, res) {
  const pictures = await User.findById(req.user._id).populate()
  res.render('secure/profile', {
    user: req.user
    //pictures: pictures.profilePicture
  })
})

// router.get('/:id/upload', ensureLoggedIn('/login'), async (req, res) => {
//   const { id } = req.params
//   const user = await User.findById(id)
//   // const authors = await Author.find()
//   // book.authors = authors
//   res.render('secure/update-profile', user)
// })

// router.post('/:id/:whatever/upload', ensureLoggedIn('/login'), upload.single('profilePicture'), async (req, res) => {
//   try {
//     const { id } = req.params //user Id
//     const pic = await Picture.create({
//       name: req.body.name,
//       path: `/uploads/${req.file.filename}`,
//       originalName: req.file.originalname
//     })
//     const picId = pic._id
//     await User.findByIdAndUpdate(id, { profilePicture: picId })
//     res.redirect('/profile')
//   } catch (err) {
//     console.log(err)
//   }
// })

router.get('/:id/trip', ensureLoggedIn('/login'), async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)
  res.render('secure/new-trip', user)
})

router.post('/:id/newTrip', ensureLoggedIn('/login'), async (req, res) => {
  try {
    const { id } = req.params //user Id
    const content = req.body.content
    let post = await Post.create({ createdBy: id, content: content })
    trip = await Trip.find().populate()
    //console.log(post)
    let createdByArray = []
    for (let index = 0; index < trip.length; index++) {
      let curUser = await User.findById(post[index].createdBy).populate()
      trip[index].clearName = curUser.username
    }
    res.render('secure/index-auth', { trip: trip, createdByArray: createdByArray })
  } catch (err) {
    console.log(err)
  }
})

router.get('/index-auth', ensureLoggedIn('/login'), async (req, res, next) => {
  let trip = await Trip.find().populate()
  let createdByArray = []
  for (let index = 0; index < trip.length; index++) {
    let curUser = await User.findById(trip[index].createdBy).populate()
    trip[index].clearName = curUser.username
  }
  const user = await User.findById(req.user._id).populate()
  res.render('secure/index-auth', { trip, createdByArray, user })
})

router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
  req.logout()
  res.redirect('/')
})

module.exports = router
