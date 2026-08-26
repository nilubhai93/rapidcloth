import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerName: { type: String, required: true },
  partnerPhone: { type: String },
  zone: { type: String, default: 'General Zone' },
  category: { type: String, required: true },
  issueDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], 
    default: 'Pending' 
  },
  adminReply: { type: String, default: '' },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model('SupportTicket', supportTicketSchema);
