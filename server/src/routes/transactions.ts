import express from 'express';
import prisma from '../prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const txs = await prisma.transaction.findMany({ where: { wallet: { userId } }, orderBy: { createdAt: 'desc' } });
  res.json(txs);
});

router.post('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { walletId, amount, description, type } = req.body;
  const tx = await prisma.transaction.create({ data: { walletId: Number(walletId), amount: Number(amount), description, type } });
  res.json(tx);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return res.status(404).json({ error: 'Not found' });
  res.json(tx);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await prisma.transaction.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
