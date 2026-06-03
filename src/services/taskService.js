const Task = require('../models/Task');
const {
  getTaskCache,
  setTaskCache,
  invalidateTaskCache,
  incrementAnalytics,
} = require('./redisService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const CACHE_TTL = () => parseInt(process.env.TASK_CACHE_TTL) || 300;

const getTasks = async (userId) => {
  const cached = await getTaskCache(userId);
  if (cached) {
    logger.debug('Task list served from cache', { userId });
    return { tasks: cached, fromCache: true };
  }

  const tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
  await setTaskCache(userId, tasks, CACHE_TTL());
  logger.debug('Task list fetched from DB and cached', { userId });
  return { tasks, fromCache: false };
};

const createTask = async (userId, { title, description, priority }) => {
  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'Medium',
    userId,
  });

  await invalidateTaskCache(userId);
  await incrementAnalytics('tasksCreated');
  logger.info('Task created', { taskId: task._id, userId });
  return task;
};

const updateTask = async (taskId, userId, updates) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  if (updates.title !== undefined) task.title = updates.title.trim();
  if (updates.description !== undefined) task.description = updates.description.trim();
  if (updates.priority !== undefined) task.priority = updates.priority;

  await task.save();
  await invalidateTaskCache(userId);
  await incrementAnalytics('tasksUpdated');
  logger.info('Task updated', { taskId: task._id, userId });
  return task;
};

const deleteTask = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!task) {
    throw new AppError('Task not found.', 404);
  }

  await invalidateTaskCache(userId);
  await incrementAnalytics('tasksDeleted');
  logger.info('Task deleted', { taskId, userId });
  return task;
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
