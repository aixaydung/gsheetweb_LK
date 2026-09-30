import { Router } from 'express';
import { getAllProducts, createProduct, createProductsBatch, updateProduct, deleteProduct } from '../repositories/products.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all products
router.get('/', requireAuth, async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true';
    const products = await getAllProducts(includeInactive);
    res.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// BATCH CREATE products (Import Excel)
router.post('/batch', requireAuth, async (req, res) => {
  try {
    const list = Array.isArray(req.body.products) ? req.body.products : Array.isArray(req.body) ? req.body : [];
    if (list.length === 0) {
      return res.status(400).json({ error: { message: 'Danh sách sản phẩm trống' } });
    }
    const created = await createProductsBatch(list);
    res.status(201).json({ count: created.length, products: created });
  } catch (error: any) {
    console.error('Error batch creating products:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// CREATE new product
router.post('/', requireAuth, async (req, res) => {
  try {
    const newProduct = await createProduct(req.body);
    res.status(201).json({ product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// UPDATE product
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateProduct(id, req.body);
    res.json({ product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

// DELETE product
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true';
    const result = await deleteProduct(id, hard);
    res.json({ success: true, message: hard ? 'Product permanently deleted' : 'Product archived', result });
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
