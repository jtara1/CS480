const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = new require('./User');
const { errorToJson } = require('../exceptions/exceptions');

/**
 * @returns all users from db.users
 */
router.get('/', function (req, res) {
  User.find({}, function (err, users) {
    if (err) return res.status(500).send(err);
    res.status(200).send(users);
  });
});

/**
 * Create users in db.users
 * Request body should contain:
 * username, password
 * Optional in request body:
 * email
 */
router.post('/register', function (req, res) {
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json(errorToJson(err));
    let newUser = {
      username: req.body.username,
      password: hashedPassword,
    };
    if (req.body.email) newUser['email'] = req.body.email;

    User.create(
      newUser,
      function (err, user) {
        if (err) return res.status(500).json(errorToJson(err));
        res.status(200).send(user);
      }
    );
  });
});

/**
 * Returns status code 200 and User document if it successfully verifies
 * username and password
 * Request body should contain:
 * {
 *  username: String,
 *  password: String,
 * }
 */
router.post('/login', function(req, res) {
  User.findOne({username: req.body.username}, (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(400).json(`no such user, username = ${req.body.username}`);

    bcrypt.compare(req.body.password, user.password, (err, matched) => {
      if (err) return res.status(500).json(err);
      if (matched) {
        return res.status(200).json(user);
      }
      return res.status(400).json({"message": "password mismatch"});
    });
  });
});

/**
 * @returns a specific users queried by their _id field from db.users
 */
router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the users.");
    if (!user) return res.status(404).send("No users found.");
    res.status(200).send(user);
  });
});

module.exports = router;