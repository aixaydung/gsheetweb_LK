import { Router } from 'express';
import {
  getAllReturns,
  createReturn,
  updateReturnStatus,
  updateReturnWithItems,
  deleteReturn,
} from '../repositories/returns.js';

export const returnsRouter = Router();

returnsRouter.get('/', async (req, res) => {
  try {
    const type = req.query.type as 'sales_return' | 'purchase_return' | undefined;
    const returns = await getAllReturns(type);
    res.json({ success: true, returns });
  } catch (error: any) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch returns' });
  }
});

returnsRouter.post('/', async (req, res) => {
  try {
    const { returnRecord, returnDoc, items } = req.body;
    const payload = returnDoc || returnRecord || req.body;
    if (!payload) {
      return res.status(400).json({ error: 'Return payload is required' });
    }
    const newReturn = await createReturn(payload, items || payload.items || []);
    res.status(201).json({ success: true, returnRecord: newReturn });
  } catch (error: any) {
    console.error('Error creating return:', error);
    res.status(500).json({ error: error.message || 'Failed to create return' });
  }
});

returnsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { returnRecord, returnDoc, items } = req.body;
    const payload = returnDoc || returnRecord || req.body;
    const updated = await updateReturnWithItems(id, payload, items || payload.items);
    res.json({ success: true, returnRecord: updated });
  } catch (error: any) {
    console.error('Error updating return:', error);
    res.status(500).json({ error: error.message || 'Failed to update return' });
  }
});

returnsRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const result = await updateReturnStatus(id, status);
    res.json({ success: true, returnRecord: result });
  } catch (error: any) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: error.message || 'Failed to update return status' });
  }
});

returnsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReturn(id);
    res.json({ success: true, message: 'Return record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting return:', error);
    res.status(500).json({ error: error.message || 'Failed to delete return' });
  }
});
