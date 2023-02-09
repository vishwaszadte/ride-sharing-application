const express = require("express");
const db = require("./database");
const session = require("express-session");
const fs = require("fs");

// routes
const driverRoutes = require("./routes/driver");
const riderRoutes = require("./routes/rider");

const app = express();
const port = process.env.PORT || 3000;

// set ejs as the default templating engine
app.set("view engine", "ejs");

// initiate the database connection
db.init();

// Middlewares
appl.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized,
  })
);
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.render("home");
});

app.use("/driver", driverRoutes);
app.use("/rider", riderRoutes);
