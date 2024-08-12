const express = require('express');
const { getUsers, getUserById, deleteUser, updateUser } = require('../controllers/userController')
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.get('/', ensureLoggedIn,  getUsers); // most likely dont need route, nice to have for checking loggedin
router.get('/:id', ensureLoggedIn, getUserById);// most likely dont need route, nice to have for checking loggedin
router.put('/:id', ensureLoggedIn, updateUser);
router.delete('/:id', ensureLoggedIn, deleteUser);

// router.put('/admin', ensureLoggedIn, updateUser);
// router.delete('/admin', ensureLoggedIn, deleteUser);

module.exports = router;