import mongoose from "mongoose";
const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    trim: true,
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],

  duration: {
    type: Number, // minutes
    required: true,
  },

  type: {
    type: String,
    enum: ["teacher_controlled", "self_paced"],
    default: "self_paced",
  },

  status: {
    type: String,
    enum: ["draft", "published", "live", "ended"],
    default: "draft",
  },

  currentQuestionIndex: {
    type: Number,
    default: 0,
  },

  startTime: Date,
  endTime: Date,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
testSchema.index({ createdBy: 1 });
testSchema.index({ createdBy: 1, status: 1 });

export default mongoose.model("Test", testSchema);
