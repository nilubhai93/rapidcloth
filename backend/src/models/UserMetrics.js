import mongoose from 'mongoose';

const userMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  height: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  bodyType: {
    type: String,
    enum: ['Thin', 'Athletic', 'Average', 'Heavy'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('UserMetrics', userMetricsSchema, 'userMetricsInfo');
