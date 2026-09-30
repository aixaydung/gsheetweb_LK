import { Router } from 'express';
import {
  getAllOrders,
  createOrderWithItems,
  updateOrderStatus,
  generateOrderCode,
  updateOrderWithItems,
  deleteOrder,
} from '../repositories/orders.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json({ orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// GET next order code
router.get('/next-code', requireAuth, async (req, res) => {
  try {
    const code = await generateOrderCode();
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// CREATE order with items
router.post('/', requireAuth, async (req, res) => {
  try {
    const { order, items } = req.body;
    const newOrder = await createOrderWithItems(order || req.body, items || req.body.items);
    res.status(201).json({ order: newOrder });
  } catch (error: any) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE order (with items)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { order, items } = req.body;
    const updated = await updateOrderWithItems(id, order || req.body, items || req.body.items);
    res.json({ order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE order status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateOrderStatus(id, status);
    res.json({ message: 'Order status updated successfully' });
  } catch (error: any) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// DELETE order (hard delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteOrder(id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
