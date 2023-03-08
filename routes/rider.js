const express = require("express");
const Rider = require("../models/rider");
const Driver = require("../models/driver");
const NodeGeocoder = require("node-geocoder");

const router = express.Router();
router.use(express.json());

router
  .route("/login")
  .get((req, res) => {
    if (req.session.riderLoggedIn) {
      res.redirect("/rider/home");
      return;
    }
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
        res.status(200).redirect("/rider/home");
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
      res.status(201).render("rider/login", {
        error: "User created successfully. Please log in.",
      });
    } catch (err) {
      console.log(err);
      res.render("rider/signup", { error: err });
    }
  });

router.route("/home").get(async (req, res) => {
  if (!req.session.riderLoggedIn) {
    res.redirect("/rider/login");
    return;
  }

  const filter = {};

  try {
    const drivers = await Driver.find(filter);
    res.status(200).render("rider/home", { drivers: drivers });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

router.route("/driver-detail/:driverId").get(async (req, res, next) => {
  const driverId = req.params["driverId"];

  Driver.findById(driverId, (err, driver) => {
    if (err) {
      res
        .status(500)
        .render("rider/driver-detail", { driver: driver, error: null });
    } else {
      if (!driver) {
        res.status(404).render("rider/driver-detail", {
          driver: driver,
          error: "Driver not found",
        });
      }
      res
        .status(200)
        .render("rider/driver-detail", { driver: driver, error: null });
    }
  });
});

router.route("/update-location").post((req, res) => {
  console.log(req.body);
  res.status(201).send({
    message: "Rider location updated successfully",
  });
});

module.exports = router;
