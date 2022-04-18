const Sequelize = require('sequelize');
const db = require('../db');

const UserConversation = db.define('user_conversation', {
  role: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = UserConversation;
