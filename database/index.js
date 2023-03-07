const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const mongoURL = process.env.MONGO_URL || dotenv.parsed.MONGO_URL;

mongoose.set("strictQuery", false);

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("db is live");
  })
  .catch((e) => {
    console.log(e);
    console.log("error connecting to the db");
  });
