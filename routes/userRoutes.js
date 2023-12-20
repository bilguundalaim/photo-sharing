const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../schema/user.js");
const Photo = require("../schema/photo.js");
const { makePasswordEntry } = require("../cs142password.js");
/**
 * URL /user/list - Returns all the User objects.
 */
router.get("/user/list", function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  User.find({}, function (err, info) {
    if (err) {
      console.error("Error in /user/list:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    if (info.length === 0) {
      response.status(500).send("Missing Users");
      return;
    }

    const responseArray = info.map((user) => ({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    }));

    response.status(200).send(JSON.stringify(responseArray));
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
router.get("/user/:id", function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("User with _id:" + id + " not found.");
    response.status(400).send("Invalid userId");
    return;
  }

  User.findById(
    id,
    "_id first_name last_name location description occupation",
    function (err, info) {
      if (err) {
        console.error("Error in /user/:id:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }

      response.status(200).send(JSON.stringify(info));
    }
  );
});

router.post("/user", function (request, response) {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = request.body;

  if (!first_name || !last_name || !password) {
    response.status(400).send("Empty required fields");
    return;
  }

  User.findOne({ login_name: login_name }, function (err, info) {
    if (err) {
      response.status(400).send("Error checking login_name");
      return;
    }

    if (info) {
      response.status(400).send("Login_name already exists");
      return;
    }

    const passwordEntry = makePasswordEntry(password);

    const newUser = new User({
      login_name: login_name,
      first_name: first_name,
      last_name: last_name,
      location: location,
      description: description,
      occupation: occupation,
      password_digest: passwordEntry.hash,
      salt: passwordEntry.salt,
    });

    newUser.save(function (error) {
      if (error) {
        response.status(400).send("Error saving user to database: ", error);
        return;
      }

      response.status(200).send(JSON.stringify(newUser));
    });
  });
});

// Get all photos that the user was mentioned.
router.get("/user/mention/:id", async function (request, response) {
  // if (!request.session.userId || request.session.userId === "") {
  //   response.status(401).send("Unauthorized");
  //   return;
  // }

  const userId = request.params.id;

  Photo.find({}, async function (err, photos) {
    if (err) {
      console.error("Error in /user/mention/:id:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    const photosWithMention = [];
    const promises = photos.map(async (photo) => {
      const userPromises = photo.mentioned_users.map(async (user) => {
        if (user.toString() === userId) {
          try {
            const owner = await User.findById(photo.user_id);
            const username = `${owner.first_name} ${owner.last_name}`;

            const responseItem = {
              file_name: photo.file_name,
              user_id: photo.user_id,
              user_name: username,
            };

            photosWithMention.push(responseItem);
          } catch (error) {
            console.error("Error in /user/mention/:id:", error);
            response.status(500).send(JSON.stringify(error));
          }
        }
      });

      await Promise.all(userPromises);
    });

    await Promise.all(promises);
    response.status(200).json(photosWithMention);
  });
});

module.exports = router;
