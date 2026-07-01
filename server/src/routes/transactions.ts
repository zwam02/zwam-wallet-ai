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
  const { walletId, balance, description, type } = req.body;

  if (!walletId || balance === undefined || !type) {
    return res.status(400).json({ error: 'walletId, balance and type are required' });
  }

  try {
    const tx = await prisma.transaction.create({
      data: {
        description: description ?? null,
        type,
        balance: Number(balance),
        wallet: { connect: { id: Number(walletId) } },
      },
    });
    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
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
