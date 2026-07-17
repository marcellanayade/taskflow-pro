import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const projectController = new ProjectController();
const taskController = new TaskController();

//protection
router.use(authMiddleware);

router.post('/', projectController.create);
router.get('/', projectController.getAll);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.delete);

router.get('/:id/tasks', taskController.getByProject);
router.post('/:id/tasks', taskController.create);

export default router;