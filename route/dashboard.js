const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { getChatsContacts } = require('../route/api/v1/api_util')
const Status = require('../models/Status');

router.get('/',ensureAuthenticated,async (req,res) => {
    const status = (await Status.findOne({id:req.user._id})).status;
    const chat_friends = await getChatsContacts(req.user._id,'');
    chat_friends.sort((a,b) => {return b.lastMessageSort - a.lastMessageSort});
    req.user.status = status;
    res.render('dashboard',{
        user:req.user,
        chat_friends:chat_friends
    });
})

module.exports=router