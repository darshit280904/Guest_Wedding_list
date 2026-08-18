const express = require('express');
const router = express.Router();
const Lot = require('../models/Lot');
const Guest = require('../models/Guest');

// GET all lots with guest count
router.get('/', async (req, res) => {
  try {
    const lots = await Lot.find().sort({ createdAt: -1 });
    const lotsWithCount = await Promise.all(
      lots.map(async (lot) => {
        const guestCount = await Guest.countDocuments({ lotId: lot._id });
        return { ...lot.toObject(), guestCount };
      })
    );
    res.json(lotsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single lot
router.get('/:id', async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    const guestCount = await Guest.countDocuments({ lotId: lot._id });
    res.json({ ...lot.toObject(), guestCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new lot
router.post('/', async (req, res) => {
  try {
    const { lotName, description, createdBy } = req.body;
    if (!lotName || !lotName.trim()) {
      return res.status(400).json({ message: 'Lot name is required' });
    }
    const lot = new Lot({
      lotName: lotName.trim(),
      description: (description || '').trim(),
      createdBy: (createdBy && createdBy.trim()) ? createdBy.trim() : 'Admin',
    });
    const savedLot = await lot.save();
    res.status(201).json(savedLot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT update a lot
router.put('/:id', async (req, res) => {
  try {
    const { lotName, description, createdBy } = req.body;
    const lot = await Lot.findByIdAndUpdate(
      req.params.id,
      { lotName, description, createdBy },
      { new: true }
    );
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    res.json(lot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a lot and all its guests
router.delete('/:id', async (req, res) => {
  try {
    const lot = await Lot.findByIdAndDelete(req.params.id);
    if (!lot) return res.status(404).json({ message: 'Lot not found' });
    await Guest.deleteMany({ lotId: req.params.id });
    res.json({ message: 'Lot and all its guests deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
