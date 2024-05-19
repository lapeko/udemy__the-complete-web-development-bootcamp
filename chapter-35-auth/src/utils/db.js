const {Client} = require("pg");

let client;

module.exports.connect = async () => {
  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports.db = client;