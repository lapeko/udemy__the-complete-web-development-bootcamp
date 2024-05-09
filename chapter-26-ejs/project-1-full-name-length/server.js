const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("./index.ejs");
});

app.post("/", (req, res) => {
  const {firstName, lastName} = req.body;
  res.render("./index.ejs", {yourNameLength: firstName.length + lastName.length});
});

app.listen(3000, () => console.log("Server running on port 3000"));
