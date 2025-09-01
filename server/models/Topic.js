const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
});

topicSchema.index({ name: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
