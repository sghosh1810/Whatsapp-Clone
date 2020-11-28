const mongoose = require('mongoose');
LastSeenSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    lastseen : {
        type: String,
        default: Date.now
    }
})
const LastSeen = mongoose.model('LastSeen',LastSeenSchema);

module.exports = LastSeen;