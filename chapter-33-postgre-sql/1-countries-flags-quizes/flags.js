const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {createClient} = require("redis");
const {Client} = require("pg");
const { v4: uuid } = require("uuid");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.APP_PORT || 3000;

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

  const res = await pgClient.query("SELECT * FROM flags");
  if (!res.rows.length)
    exitWithMessage("The flags table is empty.");

  const flags = res.rows.map(({id, ...rest}) => rest);

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static("public"));

  app.get("/", async (req, res) => {
    const id = uuid();
    const shuffledFlags = shuffleFlags(flags);
    const ttlMs = 24 * 60 * 60 * 1000;
    await redisClient.set(id, JSON.stringify({flags: shuffledFlags, score: 0}), {PX: ttlMs});
    const firstFlag = shuffledFlags.at(-1);

    res.cookie('id', id, {maxAge: ttlMs, httpOnly: true});
    res.render("index.ejs", {flag: firstFlag.flag, score: 0});
  });

  app.post("/", async (req, res) => {
    const {answer} = req.body;
    const {id} = req.cookies;

    const userData = await redisClient.get(id);
    if (!userData)
      res.redirect("/");

    let {score, flags} = JSON.parse(userData);

    const correctAnswer = flags.pop().name;

    if (correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase()) {
      score++;
      if (!flags.length)
        return res.render("game-over.ejs", {score, complete: true}); // TODO delete complete property and differentiate if user won based on provided correct answer which should not be provided in this case

      await redisClient.set(id, JSON.stringify({score, flags}));
      return res.render("index.ejs", {score, flag: flags.at(-1).flag});
    }

    res.render("game-over.ejs", {score, complete: false}); // TODO show the correct answer
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
