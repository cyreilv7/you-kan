const express = require('express');
const { getSprints, getSprintById, createSprint, deleteSprint, updateSprint } = require('../controllers/sprintController')
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
 const ensureLoggedIn = ensureLogIn();

router.get('/project/:projectId', ensureLoggedIn, getSprints);
router.get('/:id', ensureLoggedIn, getSprintById);
router.post('/project/:projectId', ensureLoggedIn, createSprint)
router.put('/:id', ensureLoggedIn, updateSprint)
router.delete('/:id', ensureLoggedIn, deleteSprint)

module.exports = router;