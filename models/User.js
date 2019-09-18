const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  city: String,
  zip: Number,
  accCo2: Number,
  accCals: Number
})

const User = mongoose.model('User', UserSchema)
module.exports = User