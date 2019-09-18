const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TripSchema = new Schema({
  fromAdr: String,
  toAdr: String,
  fromCoords: [Schema.Types.Decimal128],
  toCoords: [Schema.Types.Decimal128],
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