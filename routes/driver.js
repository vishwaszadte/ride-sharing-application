const express = require("express");
const mongoose = require("mongoose");
const Driver = require("../models/driver");

const router = new express.Router();
router.use(express.json());

router
  .route("/login")
  .get((req, res) => {
    // if (req.session.driverLoggedIn) {
    //   res.render("rider/home");
    // }
    res.render("driver/login", { error: "" });
  })
  .post((req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      res.render("driver/login", { error: "Please enter email." });
      return;
    }
    if (!password) {
      res.render("driver/login", { error: "Please enter password." });
      return;
    }

    Driver.findOne({ email: email, password: password }).then((driver) => {
      if (driver) {
        req.session.driverLoggedIn = true;
        req.session.driver = driver;
        res.status(200).send({ message: "User logged in successfully" });
      } else {
        res.render("driver/login", { error: "Invalid email or password." });
      }
    });
  });

router
  .route("/signup")
  .get((req, res) => {
    res.render("driver/signup", { error: "" });
  })
  .post(async (req, res) => {
    const driver = new Driver(req.body);

    try {
      await driver.save();
      res.status(201).render("driver/login", {
        error: "User created successfully. Please log in.",
      });
    } catch (err) {
      console.log(err);
      res.render("driver/signup", { error: err });
    }
  });

module.exports = router;
