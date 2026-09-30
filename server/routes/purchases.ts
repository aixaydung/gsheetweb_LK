import { Router } from 'express';
import {
  getAllPurchases,
  createPurchaseWithItems,
  updatePurchaseStatus,
  generatePurchaseCode,
  updatePurchaseWithItems,
  deletePurchase,
} from '../repositories/purchases.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all purchase orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const purchases = await getAllPurchases();
    res.json({ purchases });
  } catch (error: any) {
    console.error('Error fetching purchases:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// GET next purchase order code
router.get('/next-code', requireAuth, async (req, res) => {
  try {
    const code = await generatePurchaseCode();
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// CREATE purchase order with items
router.post('/', requireAuth, async (req, res) => {
  try {
    const { order, items } = req.body;
    const newPO = await createPurchaseWithItems(order || req.body, items || req.body.items);
    res.status(201).json({ purchase: newPO });
  } catch (error: any) {
    console.error('Error creating purchase order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE purchase order with items
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { order, items } = req.body;
    const updated = await updatePurchaseWithItems(id, order || req.body, items || req.body.items);
    res.json({ purchase: updated });
  } catch (error: any) {
    console.error('Error updating purchase order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE purchase order status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updatePurchaseStatus(id, status);
    res.json({ message: 'Purchase order status updated successfully' });
  } catch (error: any) {
    console.error('Error updating purchase order status:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// DELETE purchase order
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deletePurchase(id);
    res.json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting purchase order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
