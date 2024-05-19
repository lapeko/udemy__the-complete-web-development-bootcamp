const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const appRouter = require("./routes/app.router");
const dotenv = require("dotenv");
const {connect} = require("./utils/db");
const cookieParser = require("cookie-parser");

dotenv.config();

const main = async () => {
  await connect();
  const PORT = process.env.PORT || 3000;
  const app = express();

  app.set("views", path.join(__dirname, "views"));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(express.static("public"));
  app.use(cookieParser());
  app.use(appRouter);

  app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
}

main();
