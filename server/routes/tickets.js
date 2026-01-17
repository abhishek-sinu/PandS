import express from 'express';
import Ticket from '../models/Ticket.js';
import { upload } from '../config/multer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create ticket with initial problem and solution
router.post('/', async (req, res) => {
  const ticket = new Ticket({
    title: req.body.title,
    problemsSolutions: req.body.problemsSolutions || [],
  });

  try {
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ticket title
router.patch('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.body.title !== undefined) ticket.title = req.body.title;
    
    ticket.updatedAt = Date.now();
    
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add step and solution to ticket
router.post('/:id/problems', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!req.body.step || !req.body.solution) {
      return res.status(400).json({ message: 'Step and solution are required' });
    }

    ticket.problemsSolutions.push({
      step: req.body.step,
      solution: req.body.solution,
      addedAt: new Date(),
    });

    ticket.updatedAt = Date.now();
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update specific step and solution
router.patch('/:id/problems/:psId', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ps = ticket.problemsSolutions.id(req.params.psId);
    if (!ps) {
      return res.status(404).json({ message: 'Problem/Solution not found' });
    }

    if (req.body.step !== undefined) ps.step = req.body.step;
    if (req.body.solution !== undefined) ps.solution = req.body.solution;

    ticket.updatedAt = Date.now();
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete specific step and solution
router.delete('/:id/problems/:psId', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ps = ticket.problemsSolutions.id(req.params.psId);
    if (!ps) {
      return res.status(404).json({ message: 'Step/Solution not found' });
    }

    ps.deleteOne();
    ticket.updatedAt = Date.now();
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload file to problem/solution
router.post('/:id/problems/:psId/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('=== FILE UPLOAD REQUEST ===')
    console.log('Ticket ID:', req.params.id)
    console.log('Problem/Solution ID:', req.params.psId)
    console.log('File info:', req.file ? {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      path: req.file.path
    } : 'NO FILE')
    
    if (!req.file) {
      console.log('ERROR: No file uploaded')
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      console.log('ERROR: Ticket not found with ID:', req.params.id)
      return res.status(404).json({ message: 'Ticket not found' });
    }
    console.log('Ticket found:', ticket.title)

    const ps = ticket.problemsSolutions.id(req.params.psId);
    if (!ps) {
      console.log('ERROR: Problem/Solution not found with ID:', req.params.psId)
      console.log('Available IDs:', ticket.problemsSolutions.map(p => p._id.toString()))
      return res.status(404).json({ message: 'Problem/Solution not found' });
    }
    console.log('Problem/Solution found')

    ps.attachments.push({
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      uploadedAt: new Date()
    });
    console.log('Attachment added to problem/solution')

    ticket.updatedAt = Date.now();
    const updatedTicket = await ticket.save();
    console.log('Ticket saved successfully')
    console.log('=== FILE UPLOAD COMPLETE ===')
    
    res.json(updatedTicket);
  } catch (error) {
    console.error('=== FILE UPLOAD ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    res.status(400).json({ message: error.message });
  }
});

// Delete file from problem/solution
router.delete('/:id/problems/:psId/files/:fileId', async (req, res) => {
  try {
    console.log('=== DELETE ATTACHMENT REQUEST ===')
    console.log('Ticket ID:', req.params.id)
    console.log('Problem/Solution ID:', req.params.psId)
    console.log('File/Attachment ID:', req.params.fileId)

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      console.log('ERROR: Ticket not found')
      return res.status(404).json({ message: 'Ticket not found' });
    }
    console.log('Ticket found:', ticket.title)

    const ps = ticket.problemsSolutions.id(req.params.psId);
    if (!ps) {
      console.log('ERROR: Problem/Solution not found')
      return res.status(404).json({ message: 'Problem/Solution not found' });
    }
    console.log('Problem/Solution found')
    console.log('Attachments count:', ps.attachments.length)
    console.log('Attachment IDs:', ps.attachments.map(a => a._id.toString()))

    const file = ps.attachments.id(req.params.fileId);
    if (!file) {
      console.log('ERROR: File/Attachment not found with ID:', req.params.fileId)
      return res.status(404).json({ message: 'File not found' });
    }
    console.log('Attachment found:', file.originalName)

    // Delete file from filesystem
    const filePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../uploads', file.filename);
    console.log('File path:', filePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted from filesystem')
    } else {
      console.log('File does not exist on filesystem')
    }

    file.deleteOne();
    ticket.updatedAt = Date.now();
    const updatedTicket = await ticket.save();
    console.log('Ticket saved successfully')
    console.log('=== DELETE ATTACHMENT COMPLETE ===')
    res.json(updatedTicket);
  } catch (error) {
    console.error('=== DELETE ATTACHMENT ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json({ message: error.message });
  }
});

export default router;
