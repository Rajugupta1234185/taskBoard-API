const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validateTask, validateTaskUpdate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', validateTask, createTask);
router.put('/:id', validateTaskUpdate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
