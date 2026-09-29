import { Router } from 'express';
import { getAllStockMovements } from '../repositories/stockMovements.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const movements = await getAllStockMovements();
    res.json({ movements });
  } catch (error: any) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
