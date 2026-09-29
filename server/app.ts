import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import authRouter from './auth.js';
import customersRouter from './routes/customers.js';
import productsRouter from './routes/products.js';
import vendorsRouter from './routes/vendors.js';
import ordersRouter from './routes/orders.js';
import purchasesRouter from './routes/purchases.js';
import paymentsRouter from './routes/payments.js';
import stocktakesRouter from './routes/stocktakes.js';
import stockMovementsRouter from './routes/stockMovements.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://lkerp.sheetapp.store'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount routes for both with and without /api prefix (for Vercel serverless rewrites resilience)
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/customers', customersRouter);
app.use('/customers', customersRouter);

app.use('/api/products', productsRouter);
app.use('/products', productsRouter);

app.use('/api/vendors', vendorsRouter);
app.use('/vendors', vendorsRouter);

app.use('/api/orders', ordersRouter);
app.use('/orders', ordersRouter);

app.use('/api/purchases', purchasesRouter);
app.use('/purchases', purchasesRouter);

app.use('/api/payments', paymentsRouter);
app.use('/payments', paymentsRouter);

app.use('/api/stocktakes', stocktakesRouter);
app.use('/stocktakes', stocktakesRouter);

app.use('/api/stock-movements', stockMovementsRouter);
app.use('/stock-movements', stockMovementsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

export default app;
