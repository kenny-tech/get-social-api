const mongoose = require('mongoose');

const PhotoSchema = mongoose.Schema({
    picture: String,
    user: String,
    userId: String,
}, {
    timestamps: true
})

module.exports = mongoose.model('Photo', PhotoSchema);
