const { User } = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const getUsers = async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
 const getUserById = async (req, res) => {
  const userId = req.params.id
    try {
      const user = await User.findByPk(userId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Data not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
const updateUser = async (req, res) => {
  try {
    const userData = req.body;

    // Check if a new password is being set
    if (userData.password_hash) {
      // Hash the new password
      userData.password_hash = await hashPassword(userData.password_hash);
    }

    const [updated] = await User.update(userData, {
      where: { user_id: req.user.user_id }
    });
    
    if (updated) {
      res.json({ message: 'Data updated' });
    } else {
      res.status(404).json({ message: 'Data not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
  
  const deleteUser = async (req, res) => {
    try {
      const deleted = await User.destroy({
        where: { user_id: req.params.id }
      });

      if (deleted) {
        res.json({ message: 'Data deleted' });
      } else {
        res.status(404).json({ message: 'Data not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };

  module.exports = { getUsers, getUserById, updateUser, deleteUser };