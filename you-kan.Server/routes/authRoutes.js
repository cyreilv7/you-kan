const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController')
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const csrf = require('csurf');

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.use(csrf({cookie: true}));
router.use(function(req, res, next) {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrfToken = token; 
  next();
});

router.post('/register', registerUser);
router.post('/login/password', loginUser);
router.post('/logout', logoutUser);

// Route to get CSRF token
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

// Check if the user is authenticated
router.get('/is-authenticated', ensureLoggedIn, (req, res) => {
  res.json({ 
    authenticated: true, 
    user_id: req.user.user_id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    email: req.user.email
  });
});
  

module.exports = router;