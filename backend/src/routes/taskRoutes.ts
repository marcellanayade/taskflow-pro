import { Router } from 'express';
import { TaskController } from '../controllers/TaskController';

const router = Router();
const taskController = new TaskController();

//create tasks
router.post('/', taskController.create);

//list tasks
router.get('/', taskController.getAll);

//update tasks
router.put('/:id', taskController.update);

//delete tasks
router.delete('/:id', taskController.delete);

export default router;