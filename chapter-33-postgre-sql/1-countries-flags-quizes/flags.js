const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {createClient} = require("redis");
const {Client} = require("pg");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.APP_PORT || 3000;

const data = fs.readFileSync("/Users/vitalilapeka/Desktop/learn_resources/flags.csv");
const rows = data.toString().split("\r\n").slice(1);
const values = rows.map(row => {
  const regex = /"[^"]*"|[^,]+/g;
  const values = row.match(regex);
  return "(" + values.map(value => value.replace(/(^"|"$)/g, ''))
    .slice(1)
    .map(item => item.replaceAll("'", "''"))
    .map(item => item.trim() ? "'" + item.trim() + "'" : "NULL")
    .join(", ") + ")"
}).join(", ") + ";";

const pgClient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  await pgClient.connect();
  const redisClient = await createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  })
    .on("error", () => exitWithMessage("Redis connection failure."))
    .connect();

  const res = await pgClient.query(`SELECT * FROM flags`);
  if (!res.rows.length)
    exitWithMessage("The flags table is empty.");

  const flags = res.rows.map(({id, ...rest}) => rest);

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static("public"));

  app.get("/", async (req, res) => {
    if (req.cookies.id)
      await redisClient.del(req.cookies.id);

    const id = uuid();
    const shuffledFlags = shuffleFlags(flags);
    await redisClient.set(id, JSON.stringify({flags: shuffledFlags, score: 0}));
    const firstFlag = shuffledFlags.pop();

    res.cookie('id', id, {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});
    res.render("index.ejs", {flag: firstFlag.flag, score: 0});
  });

  app.post("/", (req, res) => {
    console.log(req.body);
    console.log(req.cookies.id);
    res.render("index.ejs");
  });

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})();

function shuffleFlags(flags) {
  const shuffled = [...flags];
  for (let i = 0; i < flags.length; i++) {
    const randomIdx = Math.floor(Math.random() * flags.length);
    [shuffled[i], shuffled[randomIdx]] = [shuffled[randomIdx], shuffled[i]];
  }
  return shuffled;
}

function exitWithMessage(message) {
  console.log(message);
  console.log(" Terminating the app...");
  process.exit();
}
