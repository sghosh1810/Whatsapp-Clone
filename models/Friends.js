const mongoose = require('mongoose');
FriendsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: false
    },
    friends : [
        String
    ]
})
const Friends = mongoose.model('Friends',FriendsSchema);

module.exports = Friends;