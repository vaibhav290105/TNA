const express = require('express');
const router = express.Router();
const TrainingNeed = require('../models/TrainingNeed');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Submit training request (Employee)
router.post('/submit', auth, async (req, res) => {
  try {
    let status = 'Pending_Manager';
    let managerId = null;

    if (req.user.role === 'manager') {
      status = 'Pending_HOD';
    } else if (req.user.role === 'hod') {
      status = 'Pending_Admin';
    } else {
      const userDoc = await User.findById(req.user._id).select('manager');
      if (userDoc?.manager) {
        managerId = userDoc.manager;
      }
    }

    const trainingNeed = new TrainingNeed({
      user: req.user._id,
      department: req.user.department,
      manager: managerId,
      ...req.body,
      status,
    });

    await trainingNeed.save();
    res.json({ msg: 'Training request submitted successfully' });
  } catch (err) {
    console.error('Training Request Submission Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all training requests
router.get('/all', auth, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin') {
      requests = await TrainingNeed.find({ status: 'Approved_By_HOD' })
        .populate('user', 'name email department role')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'manager') {
      requests = await TrainingNeed.find({ manager: req.user._id })
        .populate('user', 'name email department role')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'hod') {
      requests = await TrainingNeed.find({ hod: req.user._id })
        .populate('user', 'name email department role')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ msg: 'Forbidden' });
    }

    res.json(requests);
  } catch (err) {
    console.error('Fetching Training Requests Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// My Requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await TrainingNeed.find({ user: req.user.id })
      .populate('user', 'name department location')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Fetching My Training Requests Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Manager review requests
router.get('/manager-review', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).send('Forbidden');

  const requests = await TrainingNeed.find({ status: 'Pending_Manager' })
    .populate({
      path: 'user',
      match: { manager: req.user._id },
      select: 'name department',
    })
    .then(data => data.filter(r => r.user));

  res.json(requests);
});

// Manager decision
// Approve or Reject (Manager)
router.patch('/manager-review/:id', auth, async (req, res) => {
  const { decision } = req.body;
  if (req.user.role !== 'manager') return res.status(403).send('Forbidden');

  const status = decision === 'approve' ? 'Pending_HOD' : 'Rejected_By_Manager';

  await TrainingNeed.findByIdAndUpdate(req.params.id, {
    status,
    reviewedByManager: req.user._id,
  });

  res.json({ msg: `Training request ${status}` });
});


// HOD Review
router.get('/hod-review', auth, async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).send('Forbidden');

  const requests = await TrainingNeed.find({ status: 'Pending_HOD' })
    .populate('user', 'name email department role')
    .sort({ createdAt: -1 });

  res.json(requests);
});

router.patch('/hod-review/:id', auth, async (req, res) => {
  if (req.user.role !== 'hod') return res.status(403).send('Forbidden');

  const { decision } = req.body;
  const status = decision === 'approve' ? 'Approved_By_HOD' : 'Rejected_By_HOD';

  await TrainingNeed.findByIdAndUpdate(req.params.id, {
    status,
    reviewedByHOD: req.user._id,
  });

  res.json({ msg: `Training request ${status}` });
});



// Admin Review (Only if HOD approved)
router.get('/admin-review', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden');

  const requests = await TrainingNeed.find({
    status: 'Approved_By_HOD',
    department: req.user.department
  }).populate('user', 'name department role');

  res.json(requests);
});

router.patch('/admin-review/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden');

  const { decision } = req.body;
  const status = decision === 'approve' ? 'Approved_By_Admin' : 'Rejected_By_Admin';

  await TrainingNeed.findByIdAndUpdate(req.params.id, {
    status,
    reviewedByAdmin: req.user._id,
  });

  res.json({ msg: `Training request ${status}` });
});

module.exports = router;
