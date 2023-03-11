const express = require("express");
const Rider = require("../models/rider");
const Driver = require("../models/driver");
const NodeGeocoder = require("node-geocoder");
const axios = require("axios");

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

  const riderID = req.session.rider._id;

  const filter = {};

  try {
    const drivers = await Driver.find(filter);
    const rider = await Rider.findById(riderID);

    res.status(200).render("rider/home", { drivers: drivers, rider: rider });
    return;
  } catch (err) {
    res.status(500).send({ error: err });
    return;
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

router.route("/update-location").post(async (req, res) => {
  const riderID = req.session.rider._id;

  const options = {
    provider: "mapquest",
    httpAdapter: "https",
    apiKey: process.env.MAPQUEST_API_KEY,
    formatter: "json",
  };

  const geocoder = NodeGeocoder(options);

  try {
    data = await geocoder.reverse({ lat: req.body.lat, lon: req.body.lon });

    const newLocation = {
      formattedAddress: data[0].formattedAddress,
      latitude: data[0].latitude,
      longitude: data[0].longitude,
      city: data[0].city,
      country: data[0].country,
      pincode: data[0].zipcode,
    };

    Rider.updateOne({ _id: riderID }, { $set: { location: newLocation } })
      .then((result) => {
        res.status(201).send({
          data: result,
        });
        return;
      })
      .catch((err) => {
        res.status(400).send({
          error: err,
        });
        return;
      });
  } catch (err) {
    res.status(400).send({
      error: err,
    });
  }
});

module.exports = router;
