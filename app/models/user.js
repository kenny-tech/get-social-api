const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// import Photo schema
const PhotoSchema = require('../models/photo').schema;

// define our model
const userSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    name: String,
    profilePicture: String,
    password: String,
    // photo: [PhotoSchema]
});

userSchema.pre('save', async function(next){
    //'this' refers to the current document about to be saved
    const user = this;
    //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
    //your application becomes.
    const hash = await bcrypt.hash(user.password, 10);
    //Replace the plain text password with the hash and then store it
    user.password = hash;
    //Indicates we're done and moves on to the next middleware
    next();
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) { return callback(err); }

        callback(null, isMatch);
    });
};


// check to make sure that the user trying to log in has the correct credentials
userSchema.methods.isValidPassword = async function(password){
    const user = this;
    //Hashes the password sent by the user for login and checks if the hashed password stored in the
    //database matches the one sent. Returns true if it does else false.
    const compare = await bcrypt.compare(password, user.password);
    return compare;
}

// create the model class
const model = mongoose.model('user', userSchema);

// export the model
module.exports = model;
