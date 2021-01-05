const express = require('express');
const extend  =  require('extend');

const Friends = require('../../../models/Friends');
const Messages = require('../../../models/Messages');
const Status = require('../../../models/Status');
const User = require('../../../models/User');
const  {getFullProfile,addFriend,isValidRequest,addMessage,getMessage,getChatsContacts,messageQueyExcute} = require('../v1/api_util');
const { ensureAuthenticatedApi, ensureAuthenticated } = require('../../../config/auth');
const { profile_image_upload } = require('../../../config/multer');
const { route } = require('../../dashboard');

const router = express.Router();

//Search contact or all contacts
router.get('/getContacts', ensureAuthenticatedApi,async (req,res) => {
    try {
        let friends = await Friends.findOne({id:req.user._id});
        let users = await User.find({name:{$regex:req.query.name, $options: 'i'},_id:friends.friends});
        var user_frontend = [];
        for(let user = 0; user < users.length; user++) {
            let status =  await Status.findOne({id:users[user]._id});
            user_frontend.push({
                name: users[user].name,
                email : users[user].email,
                id: users[user]._id,
                profileImage: users[user].profileImage,
                status: status.status
            })
        }
        res.send({data:user_frontend})
    } catch (err) {
        res.status(400).send({message:'Invalid Search Params!'});
    }
})
//Contact as well as chat friend
router.get('/getChatsContacts', ensureAuthenticatedApi,async (req,res) => {
    try {
        let user_frontend = await getChatsContacts(req.user._id,req.query.name);
        res.send({data:user_frontend})
    } catch (err) {
        console.log(err);
        res.status(400).send({message:'Invalid Search Params!'});
    }
})
//Adds friend
router.post('/addFriend',async (req,res) => {
    try {
        res.send({data:[await addFriend(req.body.uid1,req.body.uid2),await addFriend(req.body.uid2,req.body.uid1)]});
    } catch(err) {
        res.status(400);
        res.send({message:'Something went wrong!'});
    }
})

//Gets all Friends for an user
router.get('/getFriends',async (req,res) => {
    const friends = await Friends.findOne({id:req.query.id});
    res.send({data:friends.friends});
})
//Returns full profile from id
router.get('/getFriendProfile',async(req,res) => {
    try {
        const user = await getFullProfile({_id:req.query.id});
        const status = await Status.findOne({id:req.query.id});
        res.send({data:{
            name: user.name,
            email : user.email,
            id: user._id,
            status: status.status
        }})
    } catch(err) {
        res.status(400);
        res.send({message:`No user found with id:${req.query.id}`});
    }
})
router.get('/getMessage', ensureAuthenticatedApi, async(req,res) => {
    try {
        const message_history = await getMessage(req.user._id,req.query.id);
        res.send({data:message_history});
    } catch (error) {
        console.log(error);
        res.status(500);
        res.send({message:'Something went wrong!'});
    }
})
router.post('/postMessage', ensureAuthenticatedApi, async (req,res) => {
    try {
        const message = await addMessage(req.user._id,req.body.id,{message:req.body.message.message,media:req.body.message.media},req.user._id);
        res.send({message:'Message sent successfully!'});
    } catch(err) {
        console.log(err.message);
        res.status(500);
        res.send({message:'Something went wrong!'});
    }
})

router.post('/profile/edit',ensureAuthenticatedApi ,async(req,res) => {
    try {
        await User.findOneAndUpdate({_id:req.user._id},{name:req.body.name,email:req.body.email});
        await Status.findOneAndUpdate({id:req.user._id},{status:req.body.status});
        req.user.name = req.body.name;
        req.user.email = req.body.email;
        req.user.status = req.body.status;
        res.send({message:'Updated Successfully!'});
    } catch(err) {
        res.status(400);
        res.send({message:'Something went wrong!'});
    }
})
router.post('/profile/uploadProfileImage',ensureAuthenticatedApi ,async(req,res) => {
    profile_image_upload(req, res, async (err) => {
        if(err) {
            res.status('500').send({message:err.message});
        } else {
            await User.findByIdAndUpdate(req.user._id,{profileImage:req.file.filename});
            req.user.profileImage = req.file.filename;
            res.send({file:req.file.filename,message:'Profile Picture saved successfully!'});
        }
    });
})

router.post('/updateLastSeenMessage', ensureAuthenticatedApi,async(req,res) => {
    try {
        const first_user = req.user._id;
        const second_user = req.body.id;
        let last_seen_messages = await messageQueyExcute(first_user,second_user);
        if (last_seen_messages) {
            last_seen_messages = last_seen_messages.toObject({getters:true});
            if (last_seen_messages.first_user==first_user) {
                last_seen_messages.first_user_last_seen_message = last_seen_messages.total_message_count;
                await Messages.findByIdAndUpdate({_id:last_seen_messages._id},last_seen_messages);
            } else {
                last_seen_messages.second_user_last_seen_message = last_seen_messages.total_message_count;
                await Messages.findByIdAndUpdate({_id:last_seen_messages._id},last_seen_messages);
            }
        }
        res.send({message:'Update Success'});
    } catch (err) {
        console.log(err);
        res.status('500').send({message:'Something went wrong!'});
    }
})

router.get('/getUnreadMessageCount', ensureAuthenticatedApi ,async(req,res) => {
    try {
        const message_history = await getChatsContacts(req.user._id,'');
        const unread_message_sender_id_and_count  = [];
        if(!message_history) {
            res.send({data:message_history});
        }
        message_history.forEach(users => {
            if(users.unreadMessageCount>0) {
                unread_message_sender_id_and_count.push({sender_id:users.id,unreadMessageCount:users.unreadMessageCount});
            } 
        });
        res.send({data:unread_message_sender_id_and_count});
    } catch (error) {
        console.log(error);
        res.status(500);
        res.send({message:'Something went wrong!'});
    }
})

router.get('/getUnreadMessage', ensureAuthenticatedApi,async(req,res) => {
    try {
        let unread_message = [];
        let unread_message_obj = await getMessage(req.user._id,req.query.id);
        unread_message_obj = unread_message_obj.toObject({getters:true});
        if (req.user._id == unread_message_obj.first_user) {
            unread_message = unread_message_obj.message.slice(unread_message_obj.first_user_last_seen_message,unread_message_obj.message.length);
            unread_message_obj.first_user_last_seen_message = unread_message_obj.total_message_count;
        } else {
            unread_message = unread_message_obj.message.slice(unread_message_obj.second_user_last_seen_message,unread_message_obj.message.length);
            unread_message_obj.second_user_last_seen_message = unread_message_obj.total_message_count;
        }
        await Messages.findByIdAndUpdate(unread_message_obj._id,unread_message_obj);
        res.send({data:unread_message});
    } catch(error) {
        console.log(error);
        res.status(500);
        res.send({message:'Something went wrong!'});
    }
})
module.exports=router;