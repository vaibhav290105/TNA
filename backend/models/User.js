const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['employee', 'manager', 'admin','hod'], default: 'employee' },

  department: { type: String }, 
  location: { type: String },
  managers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
],
  hod: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
resetToken: String,
resetTokenExpiry: Date,
});

module.exports = mongoose.model('User', UserSchema);
