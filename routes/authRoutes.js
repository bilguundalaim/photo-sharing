const express = require("express");
const router = express.Router();

const User = require("../schema/user.js");
const { doesPasswordMatch } = require("../cs142password.js");

router.post("/admin/login", async function (request, response) {
  const login_name = request.body.login_name;
  const password = request.body.password;

  if (!login_name) {
    response.status(400).send("Login name required");
    return;
  }

  if (!password) {
    response.status(400).send("Password required");
    return;
  }

  const user = await User.findOne({ login_name: login_name });

  if (!user) {
    response.status(400).send(`${login_name} is not a valid account`);
    return;
  }

  if (!doesPasswordMatch(user.password_digest, user.salt, password)) {
    response.status(400).send("Incorrect password");
    return;
  }

  request.session.userId = user._id;

  const responseObject = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
  };

  response.status(200).send(JSON.stringify(responseObject));
});

router.post("/admin/logout", function (request, response) {
  const sessionId = request.session.id;

  if (!sessionId) {
    response.status(400).send("No user currently logged in");
    return;
  }

  request.session.destroy();
  response.status(200).send("Logged out successfully");
});

module.exports = router;
