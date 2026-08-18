const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST parse document (PDF, Word, TXT) to text
router.post('/parse-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { mimetype, buffer, originalname } = req.file;
    let extractedText = '';

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (
      mimetype === 'text/plain' ||
      originalname.endsWith('.txt') ||
      originalname.endsWith('.csv')
    ) {
      extractedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Please upload PDF, Word (.docx), or Text (.txt) files.' });
    }

    // Clean up carriage returns and standardize newlines
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    res.json({ text: extractedText });
  } catch (err) {
    res.status(500).json({ message: `Failed to parse file: ${err.message}` });
  }
});


// GET guests by lotId (with pagination)
router.get('/', async (req, res) => {
  try {
    const { lotId, page = 1, limit = 100, search = '' } = req.query;
    if (!lotId) return res.status(400).json({ message: 'lotId is required' });

    const query = { lotId };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Guest.countDocuments(query);
    const guests = await Guest.find(query)
      .sort({ serialNumber: 1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      guests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single guest
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add single guest
router.post('/', async (req, res) => {
  try {
    const { lotId, firstName, fatherName, surname, mobileNumber, place } = req.body;
    if (!lotId) return res.status(400).json({ message: 'lotId is required' });

    const count = await Guest.countDocuments({ lotId });
    const guest = new Guest({
      lotId,
      firstName: firstName || '',
      fatherName: fatherName || '',
      surname: surname || '',
      mobileNumber: mobileNumber || '',
      place: place || '',
      serialNumber: count + 1,
    });

    const savedGuest = await guest.save();
    res.status(201).json(savedGuest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST bulk add guests (up to 500)
router.post('/bulk', async (req, res) => {
  try {
    const { lotId, guests } = req.body;
    if (!lotId) return res.status(400).json({ message: 'lotId is required' });
    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ message: 'guests array is required' });
    }
    if (guests.length > 500) {
      return res.status(400).json({ message: 'Maximum 500 guests per bulk import' });
    }

    const currentCount = await Guest.countDocuments({ lotId });
    const guestsToInsert = guests.map((g, i) => ({
      lotId,
      firstName: g.firstName || '',
      fatherName: g.fatherName || '',
      surname: g.surname || '',
      mobileNumber: g.mobileNumber || '',
      place: g.place || '',
      serialNumber: currentCount + i + 1,
    }));

    const inserted = await Guest.insertMany(guestsToInsert);
    res.status(201).json({ count: inserted.length, message: `${inserted.length} guests added successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update guest
router.put('/:id', async (req, res) => {
  try {
    const { firstName, fatherName, surname, mobileNumber, place } = req.body;
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { firstName, fatherName, surname, mobileNumber, place },
      { new: true }
    );
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE single guest
router.delete('/:id', async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });
    res.json({ message: 'Guest deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE all guests in a lot
router.delete('/lot/:lotId', async (req, res) => {
  try {
    const result = await Guest.deleteMany({ lotId: req.params.lotId });
    res.json({ message: `${result.deletedCount} guests deleted` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
