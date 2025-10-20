import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../utils/requireAuth.js';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

// List tasks for current user (or all if ADMIN)
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const where = isAdmin ? {} : { assigneeId: req.user.sub };
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    res.json(tasks);
  } catch (e) { next(e); }
});

// Create task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, dueDate, assigneeId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'OPEN',
        dueDate: dueDate ? new Date(dueDate) : null,
        assignee: assigneeId ? { connect: { id: assigneeId } } : { connect: { id: req.user.sub } },
        createdById: req.user.sub
      }
    });
    res.status(201).json(task);
  } catch (e) { next(e); }
});

// Update task
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, status, dueDate, assigneeId } = req.body;
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId
      }
    });
    res.json(task);
  } catch (e) { next(e); }
});

// Delete task
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.task.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
