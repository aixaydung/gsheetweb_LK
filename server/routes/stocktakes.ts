import { Router } from 'express';
import { getAllStocktakes, createStocktakeWithItems, updateStocktakeStatus, generateStocktakeCode } from '../repositories/stocktakes.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all stocktakes
router.get('/', requireAuth, async (req, res) => {
  try {
    const stocktakes = await getAllStocktakes();
    res.json({ stocktakes });
  } catch (error: any) {
    console.error('Error fetching stocktakes:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// GET next stocktake code
router.get('/next-code', requireAuth, async (req, res) => {
  try {
    const code = await generateStocktakeCode();
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// CREATE stocktake with items
router.post('/', requireAuth, async (req, res) => {
  try {
    const { stocktake, items } = req.body;
    const newStocktake = await createStocktakeWithItems(stocktake || req.body, items || req.body.items);
    res.status(201).json({ stocktake: newStocktake });
  } catch (error: any) {
    console.error('Error creating stocktake:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE stocktake status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateStocktakeStatus(id, status);
    res.json({ message: 'Stocktake status updated successfully' });
  } catch (error: any) {
    console.error('Error updating stocktake status:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
