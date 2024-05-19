const express = require('express');
const {Client} = require("pg");
const {createClient} = require("redis");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {v4: uuid} = require("uuid");
const dotenv = require("dotenv");
const {shuffleArray} = require("./utils/shuffle-array");

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

  const {rows: questions} = await pgClient.query("SELECT * FROM capitals");

  if (!questions.length)
    exitWithMessage("The capitals table is empty.");

  const app = express();

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static("public"));

  app.get("/", async (req, res) => {
    const {id: oldId} = req.cookies;

    if (oldId)
      await redisClient.del(oldId);

    const id = uuid();

    const shuffledCountries = shuffleArray(questions);
    await redisClient.set(id, JSON.stringify({questions: shuffledCountries, score: 0}));

    res.cookie("id", id);
    res.render("capitals.ejs", {score: 0, country: shuffledCountries.pop().country});
  });

  app.post("/", async (req, res) => {
    const {id} = req.cookies;
    const {answer} = req.body;

    if (!id)
      return res.redirect("/");

    let {score, questions} = JSON.parse(await redisClient.get(id));
    const correctAnswer = questions.pop().capital;

    if (answer.trim().toLowerCase() !== correctAnswer.trim().toLowerCase())
      return res.render("game-over.ejs", {score, correctAnswer});

    score++;

    if (!questions.length)
      return res.render("game-over.ejs", {score});

    await redisClient.set(id, JSON.stringify({score, questions}));

    res.render("capitals.ejs", {score, country: questions.pop().country});
  });

  app.listen(PORT, () => `server is running on port: ${PORT}`);
})();

function exitWithMessage(message) {
  console.log(message);
  console.log("Terminating the app...");
  process.exit();
}
