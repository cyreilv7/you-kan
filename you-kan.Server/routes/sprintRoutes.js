const express = require('express');
const { getSprint, getSprintById, createSprint, deleteSprint, updateSprint } = require('../controllers/sprintController')
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.get('/project/:projectId', ensureLoggedIn, getSprint);
router.get('/:id', ensureLoggedIn, getSprintById);
router.post('/', ensureLoggedIn, createSprint)
router.put('/:id', ensureLoggedIn, updateSprint)
router.delete('/:id', ensureLoggedIn, deleteSprint)

module.exports = router;