const fs = require('fs');
var cloudinary = require('cloudinary').v2;
require("dotenv").config();

const Photo = require('../models/photo')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Create a photo
exports.create = (req, res) => {
    
    const imageName = Date.now()+'.png';

    // to declare some path to store your converted image
    const path = './images/'+imageName;
 
    const imgdata = req.body.base64Image;

    // to convert base64 format into random filename
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    
    fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
    
    // upload image to cloudinary
    cloudinary.uploader.upload(path, function(err, result) {
        if(err){
            console.log("Error: ", err);
            res.json({
                err: err,
                message: 'could not upload image, try again'
            })
        }
        else {
            console.log("Result: ", result);
            // save image to db and return response
            const photo = new Photo({
                user: req.body.user,
                userId: req.body.userId,
                picture: result.secure_url,
            });
        
            // save photo
            photo.save()
            .then(data => {
                res.status(200).send({
                    success: true,
                    data: data,
                    message: 'success',
                });
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some errors occured while saving the photo"
                });
            });
        }
    });
    
};

// Get all photos
exports.findAll = (req, res) => {
    Photo.find()
    .then(photos => {
        res.status(200).send(photos);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some errors occured while retrieving photos"
        })
    })
}

// Get a single photo
exports.finduserPhotos = (req, res) => {
    Photo.find({userId: req.params.userId}).select('image')
    .then(photo => {
        console.log('Photo: ',photo);
        if(photo.length == 0) {
            res.status(422).send({ 
                success: false,
                data: null,
                message: 'No photo found for user id ' + req.params.userId,
            });
        } else {
            res.status(200).send({ 
                success: true,
                data: photo,
                message: 'success',
            });
        }
    })
    .catch(err => {
        return res.status(500).send({
            message: "Error retrieving photo with user id " + req.params.userId
        })
    })
}

// Get a single photo
exports.findOne = (req, res) => {
    Photo.findById(req.params.photoId)
    .then(photo => {
        if(!photo) {
            return res.status(404).send({
                message: "Photo not found with id " + req.params.photoId
            });
        }
        res.send(photo)
    })
    .catch(err => {
        return res.status(500).send({
            message: "Error retrieving photo with id " + req.params.photoId
        })
    })
}
