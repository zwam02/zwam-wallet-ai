import express from 'express';
import prisma from '../prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const wallets = await prisma.wallet.findMany({ where: { userId } });
  res.json(wallets);
});

router.post('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { name, currency } = req.body;
  const wallet = await prisma.wallet.create({ data: { name, currency, userId } });
  res.json(wallet);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { id: Number(req.params.id) } });
  if (!wallet) return res.status(404).json({ error: 'Not found' });
  res.json(wallet);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const data = req.body;
  const wallet = await prisma.wallet.update({ where: { id: Number(req.params.id) }, data });
  res.json(wallet);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.wallet.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

router.get('/:id/balance', async (req: AuthRequest, res) => {
  const walletId = Number(req.params.id);
  const txs = await prisma.transaction.findMany({ where: { walletId } });
  const balance = txs.reduce((acc, t) => acc + Number(t.amount), 0);
  res.json({ balance });
});

export default router;
