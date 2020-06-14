const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../../config');

function tokenForUser(user) {
  let expires = (Date.now() / 1000) + 60 * 30;
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp, exp: expires }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  if (!email || !password || !name ) {
    // return res.status(422).send({ error: 'All fields are required'});
    res.status(422).send({ 
      success: false,
      data: null,
      message: 'All fields are required',
    });
  }

  // See if a user with the given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }

    // If a user with email does exist, return an error
    if (existingUser) {
      // return res.status(422).send({ error: 'Email already taken' });
      res.status(422).send({ 
        success: false,
        data: null,
        message: 'Email already taken',
      });
    }
    else {
      // If a user with email does NOT exist, create and save user record
      const user = new User({
        email: email,
        password: password,
        name: name,
        profilePicture: ''
      });

      user.save(function(err) {
        if (err) { return next(err); }

        // Respond to request indicating the user was created
        res.status(200).send({ 
          success: true,
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          },
          message: 'Registration successful',
        });
      });
    }
  });
}

exports.signin = async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(422).send({ 
      success: false,
      data: null,
      message: 'You must provide email and password',
    });
  }

  //Find the user associated with the email provided by the user
  const user = await User.findOne({ email });

  if( user===null ){
    //If the user isn't found in the database, return a message
    res.status(422).send({ 
      success: false,
      data: null,
      message: 'Invalid Email or Password',
    });
  } else {
    //Validate password and make sure it matches with the corresponding hash stored in the database
    //If the passwords match, it returns a value of true.
    const validate = await user.isValidPassword(password);
      
    if( !validate ){
      //If the user isn't found in the database, return a message
      res.status(422).send({ 
        success: false,
        data: null,
        message: 'Invalid Email or Password',
      });
    } else {
      // User email and password is valid
      // Send the user a token
      res.status(200).send({ 
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          token: tokenForUser(user) 
        },
        message: 'Login successful',
      });
    }
  }
  // User has already had their email and password authenticated
  // We just need to give them a token
  // res.send({ token: tokenForUser(req.user) });
}

