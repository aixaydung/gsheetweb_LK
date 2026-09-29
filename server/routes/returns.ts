import { Router } from 'express';
import { getAllReturns, createReturn, updateReturnStatus } from '../repositories/returns.js';

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
    const { returnRecord, items } = req.body;
    if (!returnRecord) {
      return res.status(400).json({ error: 'Return payload is required' });
    }
    const newReturn = await createReturn(returnRecord, items || []);
    res.status(201).json({ success: true, returnRecord: newReturn });
  } catch (error: any) {
    console.error('Error creating return:', error);
    res.status(500).json({ error: error.message || 'Failed to create return' });
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
