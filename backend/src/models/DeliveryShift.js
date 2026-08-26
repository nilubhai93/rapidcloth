import mongoose from 'mongoose';

const deliveryShiftSchema = new mongoose.Schema({
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    index: true // Format: 'YYYY-MM-DD'
  },
  slotIds: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

// Ensure a single shift record per delivery partner per date
deliveryShiftSchema.index({ deliveryBoyId: 1, date: 1 }, { unique: true });

export default mongoose.model('DeliveryShift', deliveryShiftSchema);
