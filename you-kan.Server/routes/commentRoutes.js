const express = require('express');
const { getComments, getCommentById, createComment, deleteComment, updateComment } = require('../controllers/commentController')
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.get('/', ensureLoggedIn, getComments);
router.get('/:id', ensureLoggedIn, getCommentById);
router.post('/', ensureLoggedIn, createComment)
router.delete('/:id', ensureLoggedIn, deleteComment)
router.put('/:id', ensureLoggedIn, updateComment)

module.exports = router;