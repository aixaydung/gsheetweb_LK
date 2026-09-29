import { Router } from 'express';
import { getAllQuotations, createQuotation, updateQuotationStatus } from '../repositories/quotations.js';

export const quotationsRouter = Router();

quotationsRouter.get('/', async (req, res) => {
  try {
    const quotations = await getAllQuotations();
    res.json({ success: true, quotations });
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quotations' });
  }
});

quotationsRouter.post('/', async (req, res) => {
  try {
    const { quotation, items } = req.body;
    if (!quotation) {
      return res.status(400).json({ error: 'Quotation payload is required' });
    }
    const newQuote = await createQuotation(quotation, items || []);
    res.status(201).json({ success: true, quotation: newQuote });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ error: error.message || 'Failed to create quotation' });
  }
});

quotationsRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, converted_invoice_id } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const result = await updateQuotationStatus(id, status, converted_invoice_id);
    res.json({ success: true, quotation: result });
  } catch (error: any) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({ error: error.message || 'Failed to update quotation status' });
  }
});
