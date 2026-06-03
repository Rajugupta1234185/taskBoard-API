const mongoose = require('mongoose');
const Task = require('../models/Task');
const { getTaskCache, setTaskCache, invalidateTaskCache, incrementAnalytics } = require('./redisService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const CACHE_TTL = () => parseInt(process.env.TASK_CACHE_TTL) || 300;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const getTasks = async (userId, { limit, cursor } = {}) => {
  const pageSize = Math.min(parseInt(limit) || DEFAULT_LIMIT, MAX_LIMIT);

  if (!cursor) {
    const cached = await getTaskCache(userId);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  const filter = { userId };
  if (cursor) {
    if (!mongoose.Types.ObjectId.isValid(cursor)) {
      throw new AppError('Invalid cursor.', 400);
    }
    filter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const rows = await Task.find(filter)
    .sort({ _id: -1 })
    .limit(pageSize + 1)
    .lean();

  const hasMore = rows.length > pageSize;
  const tasks = hasMore ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasMore ? tasks[tasks.length - 1]._id.toString() : null;

  const payload = { tasks, pagination: { limit: pageSize, nextCursor, hasMore } };

  // Only cache the default first page — paginated results change too frequently
  if (!cursor) {
    await setTaskCache(userId, payload, CACHE_TTL());
  }

  return { ...payload, fromCache: false };
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
  if (!task) throw new AppError('Task not found.', 404);

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
  if (!task) throw new AppError('Task not found.', 404);

  await invalidateTaskCache(userId);
  await incrementAnalytics('tasksDeleted');
  logger.info('Task deleted', { taskId, userId });
  return task;
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
