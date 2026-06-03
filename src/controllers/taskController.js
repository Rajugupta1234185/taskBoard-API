const taskService = require('../services/taskService');

const getTasks = async (req, res, next) => {
  try {
    const { tasks, fromCache } = await taskService.getTasks(req.session.userId);
    res.json({
      success: true,
      data: { tasks, count: tasks.length },
      meta: { fromCache },
    });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.session.userId, req.body);
    res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.session.userId, req.body);
    res.json({ success: true, message: 'Task updated.', data: { task } });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.session.userId);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
