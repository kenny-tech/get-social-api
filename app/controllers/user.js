const fs = require('fs');
var cloudinary = require('cloudinary').v2;
require("dotenv").config();

const User = require('../models/user')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.updateProfile = (req, res) => {

    User.findByIdAndUpdate(req.params.userId, req.body, {new: true, useFindAndModify: false}, function(err, user) {
        if (err) {
            res.status(422).send({ 
                success: false,
                data: null,
                message: err + ': Unable to update profile. Please try again',
            });
        } else {
            res.status(200).send({ 
                success: true,
                data: user,
                message: 'Profile successfully updated',
            });
        }
    })
}

exports.updateProfilePicture = (req, res) => {

    const imgdata = req.body.base64ProfilePic;

    const imageName = Date.now()+'.png';

    // to declare some path to store your converted image
    const path = './images/'+imageName;
 
    // to convert base64 format into random filename
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    
    fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
    
    // upload image to cloudinary
    cloudinary.uploader.upload(path, function(err, result) {
        if(err){
            console.log("Error: ", err);
            res.json({
                err: err,
                message: 'Unable to upload profile picture. Please try again'
            })
        }
        else {
            console.log("Result: ", result);
            // update profile pic and return response
            const profilePic = {
                profilePicture: result.secure_url,
            };

            User.findByIdAndUpdate(req.params.userId, profilePic, {new: true, useFindAndModify: false}, function(err, user) {
                if (err) {
                    res.status(422).send({ 
                        success: false,
                        data: null,
                        message: err + ': Unable to upload profile picture. Please try again',
                    });
                } else {
                    res.status(200).send({ 
                        success: true,
                        data: user,
                        message: 'Profile picture successfully uploaded',
                    });
                }
            })
        }
    });
}

exports.getUser = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            res.status(422).send({ 
                success: false,
                data: null,
                message: 'User with User ID '+ req.params.userId +' not found',
            });
        } else {
            res.status(200).send({ 
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    profilePicture: user.profilePicture 
                },
                message: 'User found',
            });
        }
    })
}
