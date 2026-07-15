import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const projectController = new ProjectController();

//protection
router.use(authMiddleware);

router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

export default router;