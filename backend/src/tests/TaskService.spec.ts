import { TaskService } from '../services/TaskService';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
  });

  //test
  it('it should throw an error if you try to create a task without a title', async () => {
    
    //fake data
    const taskData = {
      project: '123456789' as any 
    };

    await expect(taskService.createTask(taskData)).rejects.toThrow('The task title is required.');
    
  });
});