const User = require("../../../models/User")
const extend  =  require('extend');
const Friends = require('../../../models/Friends');
const Messages = require('../../../models/Messages');
const Status  = require('../../../models/Status');

const getFullProfile = async (exp) => {
    return await User.findOne(exp);
}
const addFriend = async (first_user,second_user) => {
    let friend_query_data = extend({},await Friends.findOne({id:first_user}));
    let friend =  Object.keys(friend_query_data).length?friend_query_data.toObject({getters:true}):{id:first_user,friends:[]};
    friend.friends.push(second_user);
    friend.friends = [...new Set(friend.friends)];
    friend._id?delete friend._id:'';
    return await Friends.findOneAndUpdate({id:first_user},friend,{upsert:true})
}
const isValidRequest = (req) => {
    return req.body.id == req.user._id ? true : false;
}
/*TODO:
    See push and update!
*/
const addMessage = async (first_user,second_user,user_message,sender_id) => {
    let message_history = extend({},await messageQueyExcute(first_user,second_user));
    message_history = Object.keys(message_history).length?message_history.toObject({getters:true}):{first_user:first_user,second_user:second_user,message:[]};
    message_history.message.push({sender_id:sender_id,message:user_message.message,media:user_message.media});
    if (message_history._id) {
        message_history.total_message_count += 1;
    }
    if (sender_id == message_history.first_user) {
        message_history.first_user_last_seen_message = message_history.total_message_count;
    } else {
        message_history.second_user_last_seen_message = message_history.total_message_count;
    }
    return message_history._id ? await Messages.findByIdAndUpdate(message_history._id,message_history) : await Messages.findOneAndUpdate({first_user:first_user,second_user:second_user},{$set:{message:message_history.message}},{upsert:true,new:true});
}
const getMessage =  async(first_user,second_user) => {
    let message_history = extend({},await messageQueyExcute(first_user,second_user));
    return message_history;
}

const messageQueyExcute = async(first_user,second_user) => {
    return await Messages.findOne({$or:[{$and:[{first_user:first_user},{second_user:second_user}]},{$and:[{first_user:second_user},{second_user:first_user}]}]});
}

const getChatsContacts = async(id, name) => {
    let friends = await Friends.findOne({id:id});
    let users = await User.find({name:{$regex:name, $options: 'i'},_id:friends.friends});
    let user_frontend = [];
    for(let user = 0; user < users.length; user++) {
        let has_chat_history = await messageQueyExcute(id,users[user]._id);
        if(has_chat_history) {
            let status =  await Status.findOne({id:users[user]._id});
            user_frontend.push({
                name: users[user].name,
                email : users[user].email,
                id: users[user]._id,
                profileImage: users[user].profileImage,
                status: status.status,
                lastMessage: timeDifference(Date.now(),has_chat_history.message[has_chat_history.message.length-1].date),
                lastMessageSort: has_chat_history.message[has_chat_history.message.length-1].date,
                unreadMessageCount: (id==has_chat_history.first_user) ? has_chat_history.total_message_count - has_chat_history.first_user_last_seen_message : has_chat_history.total_message_count - has_chat_history.second_user_last_seen_message
            })
        }
    }
    return user_frontend;
}

const timeDifference = (t1,t2) => {
    var mins = Math.floor(((t1-t2)/1000)/60);
    var hours = Math.floor(mins/60);
    mins -= (hours*60);
    var days = Math.floor(hours/24);
    hours -= (days*24);
    return days>0?formatted_date(t2):(hours?hours+" hours":mins+" mins");
}
const formatted_date = (date) =>{
   var formatted_datetime="";
   var d = new Date(parseInt(date));
   formatted_datetime += d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
   return formatted_datetime;
}
module.exports = {getFullProfile:getFullProfile,addFriend:addFriend,isValidRequest:isValidRequest,addMessage:addMessage,getMessage:getMessage,getChatsContacts:getChatsContacts,messageQueyExcute:messageQueyExcute};