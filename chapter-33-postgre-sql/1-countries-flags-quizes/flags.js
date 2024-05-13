const express = require("express");
const {Pool} = require("pg");
const fs = require("fs");

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

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "learning",
  password: "1234",
  port: 5432,
});

(async () => {
  const client = await pool.connect();
  // const res = await client.query(`INSERT INTO flags (name, flag) VALUES ${values}`);
  const res = await client.query(`SELECT * FROM flags`);
  console.log(res);

  // const app = express();
  //
  // app.use(express.static("public"));
  //
  // app.get("/", (req, res) => {
  //   res.render("index.ejs");
  // });
  //
  // app.listen(3000, () => console.log("Server is running on port 3000"));
})();
