import { Router } from 'express';
import multer from 'multer';
import geminiService from '../services/gemini.js';
import catalogService from '../services/catalog.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Analyze image and create catalog entry
router.post('/analyze/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }

    const analysis = await geminiService.analyzeImage(
      req.file.buffer,
      req.file.mimetype
    );

    const entry = await catalogService.create({
      ...analysis,
      sourceType: 'image',
      originalFilename: req.file.originalname
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// Analyze text description and create catalog entry
router.post('/analyze/text', async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description required' });
    }

    const analysis = await geminiService.analyzeText(description);
    const entry = await catalogService.create({
      ...analysis,
      sourceType: 'text',
      originalDescription: description
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// Analyze both image and text
router.post('/analyze/combined', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }

    const description = req.body.description || '';
    const analysis = await geminiService.analyzeImageAndText(
      req.file.buffer,
      req.file.mimetype,
      description
    );

    const entry = await catalogService.create({
      ...analysis,
      sourceType: 'combined',
      originalFilename: req.file.originalname,
      originalDescription: description
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// Batch categorize multiple products
router.post('/analyze/batch', async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array required' });
    }

    const categorizations = await geminiService.batchCategorize(products);
    
    const entries = await Promise.all(products.map((product, index) => {
      const categorization = categorizations.find(c => c.index === index) || {};
      return catalogService.create({
        ...product,
        ...categorization,
        sourceType: 'batch'
      });
    }));

    res.status(201).json(entries);
  } catch (err) {
    next(err);
  }
});

// Get all catalog entries
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const entries = await catalogService.getAll({ category, status, search });
    res.json(entries);
  } catch (err) { next(err); }
});

// Get catalog stats
router.get('/stats', async (req, res, next) => {
  try {
    res.json(await catalogService.getStats());
  } catch (err) { next(err); }
});

// Get single entry
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await catalogService.getById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json(entry);
  } catch (err) { next(err); }
});

// Update entry
router.patch('/:id', async (req, res, next) => {
  try {
    const entry = await catalogService.update(req.params.id, req.body);
    res.json(entry);
  } catch (err) { next(err); }
});

// Publish entry
router.post('/:id/publish', async (req, res, next) => {
  try {
    const entry = await catalogService.publish(req.params.id);
    res.json(entry);
  } catch (err) { next(err); }
});

// Delete entry
router.delete('/:id', async (req, res, next) => {
  try {
    await catalogService.delete(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
