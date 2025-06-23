require("dotenv").config(); // Load .env variables if you want

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "db_vm_sys",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    timezone: "+05:30",
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || "database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    timezone: "+05:30",
  },
  production: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD || "db_vm_sys",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    timezone: "+05:30",
  },
};
