const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema(
  {
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    fatherName: {
      type: String,
      trim: true,
      default: '',
    },
    surname: {
      type: String,
      trim: true,
      default: '',
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    place: {
      type: String,
      trim: true,
      default: '',
    },
    serialNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', GuestSchema);
