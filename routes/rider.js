const express = require("express");
const Rider = require("../models/rider");

const router = express.Router();
router.use(express.json());

router
  .route("/login")
  .get((req, res) => {
    res.render("rider/login", { error: "" });
  })
  .post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      res.render("rider/login", { error: "Please enter email." });
      return;
    }
    if (!password) {
      res.render("rider/login", { error: "Please enter password." });
      return;
    }

    Rider.findOne({ email: email, password: password }).then((rider) => {
      if (rider) {
        req.session.riderLoggedIn = true;
        req.session.rider = rider;
        res.status(200).send({ message: "User logged in successfully" });
      } else {
        res.render("rider/login", { error: "Invalid email or password." });
      }
    });
  });

router
  .route("/signup")
  .get((req, res) => {
    res.render("rider/signup", { error: "" });
  })
  .post(async (req, res) => {
    const rider = new Rider(req.body);

    try {
      await rider.save();
      res.status(201).send({ message: "Account created successfully." });
    } catch (err) {
      console.log(err);
      res.render("rider/signup", { error: err });
    }
  });

module.exports = router;
