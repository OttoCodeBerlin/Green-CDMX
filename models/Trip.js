const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TripSchema = new Schema({
  name: String,
  //postPicture: { type: Schema.Types.ObjectId, ref: 'Picture' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
})

const Trip = mongoose.model('Trip', TripSchema)
module.exports = Trip