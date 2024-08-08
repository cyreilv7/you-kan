const { User } = require('../models');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const getUsers = async (req, res) => {
  console.log(req.user)
    try {
      const users = await User.findAll();
      res.json({ message: 'All user data', data: users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
 const getUserById = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.user_id);
      if (user) {
        res.json({ message: 'Get single data', data: user });
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
      console.log(userData.password_hash);
    
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
        where: { user_id: req.user.user_id }
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