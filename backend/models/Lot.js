const mongoose = require('mongoose');

const LotSchema = new mongoose.Schema(
  {
    lotName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lot', LotSchema);
