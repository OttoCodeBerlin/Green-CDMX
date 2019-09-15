const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  city: String,
  zip: Number
  //profilePicture: { type: Schema.Types.ObjectId, ref: 'Picture' }
})

const User = mongoose.model('User', UserSchema)
module.exports = User