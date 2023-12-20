const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);

const User = require("../schema/user.js");
const Photo = require("../schema/photo.js");

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
router.get("/photosOfUser/:id", async function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  const userId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Photos of user with _id " + userId + " not found.");
    response.status(400).send("Invalid UserId");
    return;
  }

  Photo.find({ user_id: userId }, async function (err, info) {
    if (err) {
      console.error("Error in /photosOfUser/:id:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    const responseArray = await Promise.all(
      info.map(async (photo) => {
        const commentsWithUser = await Promise.all(
          photo.comments.map(async (comment) => {
            const user = await User.findById(
              comment.user_id,
              "_id first_name last_name"
            );
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user: user,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: commentsWithUser,
        };
      })
    );

    response.status(200).send(JSON.stringify(responseArray));
  });
});

router.get("/photosAndCommentsCountOfUser/:userId", function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  const userId = request.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    response.status(400).send("Invalid User");
    return;
  }

  Photo.find({}, function (err, info) {
    if (err) {
      console.error("Error in /photosAndCommentsCountOfUser/:userId:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    const photoCount = info.filter(
      (photo) => String(photo.user_id) === userId
    ).length;

    let commentsOfUser = [];
    info.forEach((photo) => {
      const comments = photo.comments;
      comments.forEach((comment) => {
        if (String(comment.user_id) === userId) {
          commentsOfUser.push({
            ...comment._doc,
            photo_id: photo._id,
            photo_file_name: photo.file_name,
            photo_user_id: photo.user_id,
          });
        }
      });
    });

    const responseObject = {
      photoCount: photoCount,
      commentCount: commentsOfUser.length,
      commentsOfUser: commentsOfUser,
    };

    response.status(200).send(JSON.stringify(responseObject));
  });
});

router.post("/commentsOfPhoto/:photo_id", function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  const photoId = request.params.photo_id;
  const comment = request.body.comment;
  // Get mentioned_userId from request. 
  const mentioned_userId = request.body.mentioned_userId;

  if (comment.length === 0) {
    response.status(400).send("Empty comment");
    return;
  }

  Photo.findById(photoId, function (err, info) {
    if (err) {
      console.error("Error in /commentsOfPhoto/:photo_id:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }

    if (!info) {
      response.status(404).send("Photo not found");
      return;
    }

    // If there is an mentioned user. Add the user into photo's mentioned_users array.
    if (mentioned_userId) {
      info.mentioned_users.push(mentioned_userId);
    }

    info.comments.push({
      comment: comment,
      date_time: new Date(),
      user_id: request.session.userId,
    });

    info.save(function (error) {
      if (error) {
        console.error("error updating photo: ", error);
        response.status(500).send(JSON.stringify(error));
        return;
      }

      response.status(200).send("New comment added successfully");
    });
  });
});

router.post("/photos/new", function (request, response) {
  if (!request.session.userId || request.session.userId === "") {
    response.status(401).send("Unauthorized");
    return;
  }

  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      response.status(400).send("There is no file");
      return;
    }

    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
      if (error) {
        response.status(500).send("Error writing file into ./images/:" + error);
        return;
      }

      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.userId,
        comments: [],
      });

      newPhoto.save(function (erro) {
        if (erro) {
          response.status(500).send("Error saving photo to database: ", erro);
          return;
        }

        response.status(200).send("Photo uploaded successfully");
      });
    });
  });
});

module.exports = router;