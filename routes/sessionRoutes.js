const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../schema/user.js");

router.get("/checkSession", function (request, response) {
  const sessionId = request.session.id;

  const client = new mongoose.mongo.MongoClient("mongodb://127.0.0.1");
  client.connect().then(() => {
    const db = client.db("cs142project6");
    const collection = db.collection("sessions");

    collection.findOne({ _id: sessionId}, function (err, info) {
      if (err || !info) {
        response.status(400).send("Error finding session");
        return;
      }

      const userId = info.session.userId;
      User.findOne(
        { _id: userId },
        "_id first_name last_name location description occupation",
        function (error, user) {
          if (error) {
            response.status(400).send("Error finding user");
            return;
          }

          response.status(200).send(JSON.stringify(user));
        }
      );
    });
  });
});

module.exports = router;