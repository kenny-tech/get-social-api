const Authentication = require('./controllers/authentication');
const passwordService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

const photos = require('../app/controllers/photo');
const user = require('../app/controllers/user');
const comment = require('../app/controllers/comment')

module.exports = (app) => {
    
     // Create a new photo
     app.post('/photos', photos.create);

     // Retrieve all photos
     app.get('/photos', photos.findAll);
 
     // Retrieve a single photo with photoId
     app.get('/photos/:photoId', photos.findOne); 

    // app.post('/signin', requireSignin, Authentication.signin);
    app.post('/signin', Authentication.signin);

    app.post('/signup', Authentication.signup);

    app.put('/updateProfile/:userId', user.updateProfile);

    // Create a comment
    app.post('/comments', comment.create);

    // Get a comment
    app.get('/comments/:photoId', comment.findOne); 

    // Get user photos
    app.get('/userPhotos/:userId', photos.finduserPhotos); 

    // app.get('/profile', requireAuth, (req, res, next) => {
    //     res.send('This is your profile');
    // });
};
