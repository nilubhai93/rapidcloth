import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    unique: true,
    trim: true
  },
  zoneId: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true
  },
  code: {
    type: String,
    required: [true, 'Zone code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    default: '',
    trim: true
  },
  pincodes: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    default: ''
  },
  assignedAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    radiusKm: { type: Number, default: 5 }
  },
  polygon: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

// Index pincodes for fast zone lookup
zoneSchema.index({ pincodes: 1 });

export default mongoose.model('Zone', zoneSchema);
