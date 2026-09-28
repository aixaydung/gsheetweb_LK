import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../repositories/products.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET all products
router.get('/', requireAuth, async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
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
    await deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ error: { code: 'DATABASE_ERROR', message: error.message } });
  }
});

export default router;
