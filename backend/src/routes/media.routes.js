import express from 'express';
import { protect as auth } from '../middleware/auth.middleware.js';
import mediaService from '../services/media.service.js';
import MediaAsset from '../models/MediaAsset.model.js';

const router = express.Router();

// Configure multer
const upload = mediaService.getMulterConfig();

// Get media library
router.get('/', auth, async (req, res) => {
  try {
    const { folder, fileType, tags, search, limit, skip, sortBy, sortOrder } = req.query;
    
    const result = await mediaService.getMediaLibrary(req.user.id, {
      folder,
      fileType,
      tags: tags ? tags.split(',') : undefined,
      search,
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      sortBy: sortBy || 'createdAt',
      sortOrder: parseInt(sortOrder) || -1
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get folders
router.get('/folders', auth, async (req, res) => {
  try {
    const folders = await mediaService.getFolders(req.user.id);
    res.json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get storage stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await mediaService.getStorageStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload single file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const metadata = {
      folder: req.body.folder || 'uncategorized',
      tags: req.body.tags ? req.body.tags.split(',') : []
    };

    const asset = await mediaService.uploadFile(req.user.id, req.file, metadata);
    
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', auth, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const metadata = {
      folder: req.body.folder || 'uncategorized',
      tags: req.body.tags ? req.body.tags.split(',') : []
    };

    const results = await mediaService.uploadMultiple(req.user.id, req.files, metadata);
    
    res.status(201).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single media
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await MediaAsset.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update media
router.put('/:id', auth, async (req, res) => {
  try {
    const { folder, tags, originalName } = req.body;
    
    const asset = await mediaService.updateMedia(req.params.id, req.user.id, {
      folder,
      tags,
      originalName
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    await mediaService.deleteMedia(req.params.id, req.user.id);
    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk delete
router.post('/bulk-delete', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid ids array' });
    }

    const results = await mediaService.bulkDelete(ids, req.user.id);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI analyze media
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const asset = await mediaService.analyzeMedia(req.params.id, req.user.id);
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
