const express = require('express');
const { getSubtasks, getSubtaskById, createSubtask, deleteSubtask, updateSubtask } = require('../controllers/subtaskController');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.get('/', ensureLoggedIn, getSubtasks);
router.get('/:id', ensureLoggedIn, getSubtaskById);
router.post('/', ensureLoggedIn, createSubtask)
router.delete('/:id', ensureLoggedIn, deleteSubtask)
router.put('/:id', ensureLoggedIn, updateSubtask)

module.exports = router;