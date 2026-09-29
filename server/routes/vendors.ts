import { Router } from 'express';
import { getAllVendors, createVendor, createVendorsBatch, updateVendor, deleteVendor } from '../repositories/vendors.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all vendors
router.get('/', requireAuth, async (req, res) => {
  try {
    const vendors = await getAllVendors();
    res.json({ vendors });
  } catch (error: any) {
    console.error('Error fetching vendors:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// BATCH CREATE vendors (Import Excel)
router.post('/batch', requireAuth, async (req, res) => {
  try {
    const list = Array.isArray(req.body.vendors) ? req.body.vendors : Array.isArray(req.body) ? req.body : [];
    if (list.length === 0) {
      return res.status(400).json({ error: { message: 'Danh sách nhà cung cấp trống' } });
    }
    const created = await createVendorsBatch(list);
    res.status(201).json({ count: created.length, vendors: created });
  } catch (error: any) {
    console.error('Error batch creating vendors:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// CREATE vendor
router.post('/', requireAuth, async (req, res) => {
  try {
    const newVendor = await createVendor(req.body);
    res.status(201).json({ vendor: newVendor });
  } catch (error: any) {
    console.error('Error creating vendor:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE vendor
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateVendor(id, req.body);
    res.json({ vendor: updated });
  } catch (error: any) {
    console.error('Error updating vendor:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// DELETE vendor
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVendor(id);
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting vendor:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
