import { Router } from 'express';
import { getAllPayments, createPayment, cancelPayment, generatePaymentCode } from '../repositories/payments.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all payments
router.get('/', requireAuth, async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// GET next payment code
router.get('/next-code', requireAuth, async (req, res) => {
  try {
    const direction = (req.query.direction as 'in' | 'out') || 'in';
    const code = await generatePaymentCode(direction);
    res.json({ code });
  } catch (error: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// CREATE payment
router.post('/', requireAuth, async (req, res) => {
  try {
    const newPayment = await createPayment(req.body);
    res.status(201).json({ payment: newPayment });
  } catch (error: any) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// CANCEL payment
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await cancelPayment(id);
    res.json({ message: 'Payment cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling payment:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
