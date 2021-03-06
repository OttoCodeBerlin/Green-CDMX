//removed ENV=development from .env

require('dotenv').config()
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/User')
const bcrypt = require('bcrypt')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const flash = require('connect-flash')
const hbs = require('hbs')

mongoose
  .connect(process.env.DB, { useNewUrlParser: true })
  .then(x => {
    console.log('todo bien')
  })
  .catch(err => {
    console.log('hay un error', err)
  })

const app_name = require('./package.json').name
//const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`)

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(
  session({
    secret: 'greenmexxxsecret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
)

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err)
    }
    cb(null, user)
  })
})

passport.use(
  'local-login',
  new LocalStrategy((username, password, next) => {
    User.findOne(
      {
        username
      },
      (err, user) => {
        if (err) {
          return next(err)
        }
        if (!user) {
          return next(null, false, {
            message: 'Incorrect username'
          })
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return next(null, false, {
            message: 'Incorrect password'
          })
        }

        return next(null, user)
      }
    )
  })
)

passport.use(
  'local-signup',
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    (req, username, password, next) => {
      // To avoid race conditions
      process.nextTick(() => {
        User.findOne(
          {
            username: username
          },
          (err, user) => {
            if (err) {
              return next(err)
            }

            if (user) {
              return next(null, false)
            } else {
              // Destructure the body
              const { firstname, lastname, username, email, password, bodyweight } = req.body
              const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
              const newUser = new User({
                firstname,
                lastname,
                username,
                email,
                password: hashPass,
                bodyweight,
                accCo2: 0,
                accCals: 0
              })

              newUser.save(err => {
                if (err) {
                  next(null, false, {
                    message: newUser.errors
                  })
                }
                return next(null, newUser)
              })
            }
          }
        )
      })
    }
  )
)
// Middleware Setup
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Express View engine setup

app.use(
  require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
  })
)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator'

const index = require('./routes/index')
const authRoutes = require('./routes/auth')
app.use('/', index)
app.use('/', authRoutes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
