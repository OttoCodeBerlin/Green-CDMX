const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TripSchema = new Schema({
  fromAdr: String,
  toAdr: String,
  fromCoords: [Number],
  toCoords: [Number],
  status: {
    type: String,
    enum: ['Pending Confirmation', 'Confirmed'],
    default: 'Pending Confirmation'
  },
  co2: Number,
  cal: Number,
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
})

const Trip = mongoose.model('Trip', TripSchema)
module.exports = Trip