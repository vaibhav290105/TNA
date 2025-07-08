const mongoose = require('mongoose');

const TrainingNeedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: String,
 
  
  
  generalSkills: String,
  toolsTraining: String,
  softSkills: String,


  confidenceLevel: String,
  technicalSkills: String,
  dataTraining: String,

  
  roleChallenges: String,
  efficiencyTraining: String,
  certifications: String,


  careerGoals: String,
  careerTraining: String,

  
  trainingFormat: String,
  trainingDuration: String,
  learningPreference: String,


  pastTraining: String,
  pastTrainingFeedback: String,
  trainingImprovement: String,

  
  areaNeed: String,
  trainingFrequency: String,

  status: {
  type: String,
  enum: [
    'Pending_Manager',
    'Rejected_By_Manager',
    'Approved_By_Manager',
    'Pending_HOD',
    'Rejected_By_HOD',
    'Approved_By_HOD',
    'Pending_Admin',
    'Approved_By_Admin',
    'Rejected_By_Admin'
  ],
  default: 'Pending_Manager'
},
submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
reviewedByManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
reviewedByHOD: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
reviewedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
manager: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('TrainingNeed', TrainingNeedSchema);
