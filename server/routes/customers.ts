import { Router } from 'express';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '../repositories/customers.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all customers
router.get('/', requireAuth, async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// CREATE new customer
router.post('/', requireAuth, async (req, res) => {
  try {
    const newCustomer = await createCustomer(req.body);
    res.status(201).json({ customer: newCustomer });
  } catch (error: any) {
    console.error('Error creating customer:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE customer
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCustomer(id, req.body);
    res.json({ customer: updated });
  } catch (error: any) {
    console.error('Error updating customer:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// DELETE customer
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCustomer(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
