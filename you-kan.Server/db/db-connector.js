/*
    Instantiates sequelize object and db connector function
*/

// load configs for test database if test environment, otherwise default to regular .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env' 

console.log(envFile);

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: envFile });

// bit of a hack since sequelize wants an object/function but .env file cand only contains strings
const logger = process.env.LOGGER === 'false' ? false : console.log;

// const dialectModule = process.env.NODE_ENV === 'test' ? null : require('mysql2');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    storage: process.env.STORAGE,
    host: process.env.DB_HOST,
    dialect: process.env.DIALECT,
    port: process.env.DB_PORT,
    logging: logger,
    dialectModule: require('mysql2'),
  }
);

module.exports = sequelize;