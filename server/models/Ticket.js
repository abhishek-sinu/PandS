import mongoose from 'mongoose';

const problemSolutionSchema = new mongoose.Schema({
  step: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
  attachments: [
    {
      originalName: String,
      filename: String,
      filePath: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  problemsSolutions: [problemSolutionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Ticket', ticketSchema);
