const express = require("express");
const {Pool} = require("pg");
const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "learning",
  password: "1234",
  port: 5432,
});

(async () => {
  await pool.connect();

  const app = express();

  app.use(express.static("public"));

  app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  app.listen(3000, () => console.log("Server is running on port 3000"));
})();
