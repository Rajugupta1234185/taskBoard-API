const AppError = require('../utils/AppError');

const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return next(new AppError('Full name must be at least 2 characters.', 400));
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return next(new AppError('A valid email address is required.', 400));
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters.', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return next(new AppError('A valid email address is required.', 400));
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    return next(new AppError('Password is required.', 400));
  }

  next();
};

const validateTask = (req, res, next) => {
  const { title, priority } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 1) {
    return next(new AppError('Task title is required.', 400));
  }

  if (title.trim().length > 200) {
    return next(new AppError('Title cannot exceed 200 characters.', 400));
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (priority && !validPriorities.includes(priority)) {
    return next(new AppError('Priority must be Low, Medium, or High.', 400));
  }

  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { title, priority, description } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1) {
      return next(new AppError('Task title cannot be empty.', 400));
    }
    if (title.trim().length > 200) {
      return next(new AppError('Title cannot exceed 200 characters.', 400));
    }
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return next(new AppError('Priority must be Low, Medium, or High.', 400));
  }

  if (description !== undefined && typeof description !== 'string') {
    return next(new AppError('Description must be a string.', 400));
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateTask, validateTaskUpdate };
