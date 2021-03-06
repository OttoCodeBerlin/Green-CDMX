const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../models/User')
const Trip = require('../models/Trip')
const nodemailer = require('nodemailer')
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login')

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('secure/login', { message: req.flash('error') })
})

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/profile',
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
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  })
)

router.get('/profile', ensureLoggedIn('/login'), async function(req, res) {
  const pictures = await User.findById(req.user._id).populate()
  res.render('secure/profile', {
    user: req.user
  })
})

router.get('/:id/trip', ensureLoggedIn('/login'), async (req, res) => {  //New Trip Get
  const { id } = req.params
  const user = await User.findById(id)
  const trip = await Trip.find({ userId: id }).then(trips => {
    res.render('secure/new-trip', { user, trips })
  })
})

router.post('/:id/newTrip', ensureLoggedIn('/login'), async (req, res) => { //New Trip post generates email
  let { id } = req.params
  let { fromAdr, toAdr, fromLng, fromLat, toLng, toLat, co2, cal } = req.body
  let userId = id
  let email
  const userEmail = User.findById(userId).then(user => {
    email = user.email
  })
  let fromCoords = [fromLng, fromLat]
  let toCoords = [toLng, toLat]
  const newTrip = new Trip({
    fromAdr,
    toAdr,
    fromCoords,
    toCoords,
    userId,
    co2,
    cal
  })
  newTrip
    .save()
    .then(data => {
      console.log(data)
      transporter.sendMail({
        from: '"Green CDMX" <mailer@greencdmx.com>',
        to: email,
        subject: 'Confirm Your Next Trip with Green CDMX',
        text:
          'Hello' +
          '! Please click here to confirm your route: ' +
          req.headers.origin +
          '/secure/confirm/' +
          data._id +
          '/' +
          data.userId +
          '. Thank you!'
      })
    })
    .then(info => res.render('secure/email-sent', { email }))
    .catch(err => {
      res.render('secure/new-trip', { message: 'Something went wrong' })
    })
})

router.get('/secure/confirm/:tripid/:userid', (req, res) => {  //This route is called when the user clicks the email link
  let globalParams = req.params
  let co2Trip
  let calTrip
  let tripOriginLat
  let tripOriginLng
  let tripDestinationLat
  let tripDestinationLng
  Trip.findById(req.params.tripid).then(trip => {
    tripOriginLat = trip.fromCoords[0]
    tripOriginLng = trip.fromCoords[1]
    tripDestinationLat = trip.toCoords[0]
    tripDestinationLng = trip.toCoords[1]
    let statusActual = trip.status
    co2Trip = trip.co2
    calTrip = trip.cal
    if (statusActual === 'Pending Confirmation') {
      Trip.findByIdAndUpdate(globalParams.tripid, { status: 'Confirmed' }).then(trip => { //Set trip to "confirmed"
        User.findById(globalParams.userid).then(user => {
          let co2 = user.accCo2 + co2Trip
          let cal = user.accCals + calTrip
          User.findByIdAndUpdate(globalParams.userid, { accCo2: co2, accCals: cal }) //Credit the CO2 and calories to the user account
            .then(user => {
              let googleMapsLink = //Generate Google Maps link
                'https://www.google.com/maps/dir/?api=1&origin=' +
                tripOriginLng +
                ',' +
                tripOriginLat +
                '&destination=' +
                tripDestinationLng +
                ',' +
                tripDestinationLat
              res.render('secure/email-clicked', { user, co2Trip, calTrip, googleMapsLink })
            })
        })
      })
    } else if (statusActual === 'Confirmed') { //If link was already clicked, show error message.
      res.render('secure/route-exists')
    }
  })
})


router.get('/logout', ensureLoggedIn('/login'), (req, res) => {
  req.logout()
  res.redirect('/')
})

let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})

module.exports = router
