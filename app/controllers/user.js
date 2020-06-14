const User = require('../models/user')

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
            const profilePic = new User({
                picture: result.secure_url,
            });

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

