var BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")?'http://localhost:3000/':window.location.origin+'/';

$(function() {
    $(".preload").fadeOut(2000, function() {
        $(".main-content").fadeIn(1000);
        if (isDashboard())  { 
            setTimeout(() => {changeMessageTime()},1000);
            setInterval(() => {get_unread_message_ajax()},10000);
        }
    });
});
$(document).ready(() => {
    emoji_modal_builder();
})
$('#contact-search').on('keypress',(e) => { 
    e.which==13?searchChatContacts():'';
});

$('#chat-user-message-send-field').on('keypress', (e) => {
    e.which==13?$('.chat-send').click():'';
})

$('#search-icon').click(() => {
    searchChatContacts();
});

$('#profile-edit-btn').on('click',() => {
    var edit_arr = ['name','email','status'];
    edit_arr.forEach(val => {
        $('#profile-'+val).addClass('d-none');
        $('#profile-'+val).after('<input type="text" id="profile-'+val+'-edit" class="form-control form-control-lg bg-light border-light" value="'+ $('#profile-'+val).text() +'">');
    });
    $('#profile-edit-btn').closest('div').addClass('d-none');
    $('#profile-save-btn').closest('div').removeClass('d-none');
});

$('#profile-save-btn').on('click', () => {
    $('#profile-edit-btn').closest('div').removeClass('d-none');
    $('#profile-save-btn').closest('div').addClass('d-none');
    $('#profile-edit-btn').prop('disabled',true);
    $.ajax({
        type: 'POST',
        url: BASE_URL+'api/profile/edit',
        data: { email:$('#profile-email-edit').val(), status:$('#profile-status-edit').val(), name:$('#profile-name-edit').val()},
        dataType: "text",
        success: function(res){
            res =  JSON.parse(res);
            var edit_arr = ['name','email','status'];
            edit_arr.forEach(val => {
                $('#profile-'+val).removeClass('d-none');
                $('#profile-'+val).text($('#profile-'+val+'-edit').val());
                $('#profile-'+val+'-edit').remove();
            });
            toast_message_builder('success','white',{header:'',time:'',data:res.message});
            $('#profile-edit-btn').prop('disabled',false);
        },
        error: function (jqXHR, exception) {
            $('#chat-user-message-send-field').val('');
            toast_message_builder('danger','white',{header:'',time:'',data:JSON.parse(jqXHR.responseText).message});
        }
    });
});

$('#profile-picture-edit-btn').on('click',() => {
    $('#profile-picture-edit-field').click();
});

$('#profile-picture-edit-field').change(function() {
    $("#profile-picture-edit-form").submit();
});

$("#profile-picture-edit-form").submit(function(evt){	 
    evt.preventDefault();
    var formData = new FormData($(this)[0]);
    $.ajax({
        url: BASE_URL+'api/profile/uploadprofileimage',
        type: 'POST',
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        success: function (res) {
            $('body').find('.rounded-circle.avatar-lg.img-thumbnail,.profile-user.rounded-circle').attr('src','user_files/profile_images/'+res.file);
            toast_message_builder('success','white',{header:'',time:'',data:res.message});
        },
        error: function (jqXHR, exception) {
            $('#chat-user-message-send-field').val('');
            toast_message_builder('danger','white',{header:'',time:'',data:JSON.parse(jqXHR.responseText).message});
        }
    });
    return false;
});

$('body').on('click','.chat-user-profile',function(event) {
    if (!($(this).closest('li').hasClass('active'))) {
        var _this = $(this);
        $('.user-chat.w-100').css('display','none');
        $('.preload-chat').css('display','flex');
        var chat_user_id = _this.attr('id').split('-').slice(-1)[0];
        var chat_user_img = _this.find('.chat-user-img').children('img').attr('src');
        var chat_user_name = _this.find('.chat-user-friend-name').text();
        $('#chat-history-list li').removeClass('active');
        $('.user-chat-header').empty();
        _this.closest('li').addClass('active');
        $.ajax({
            type: 'GET',
            url: BASE_URL+'api/getmessage',
            data: {id:chat_user_id},
            dataType: "text",
            success: function(res){
                res = JSON.parse(res);
                $('.list-unstyled.mb-0').empty();
                chat_section_wrapper_builder({name:chat_user_name,profileImage:chat_user_img});
                chat_section_builder(res.data.message,{profileImage:chat_user_img,name:chat_user_name},$('#profile-id').text())
                $('.preload-chat').css('display','none');
                $('.user-chat.w-100').fadeIn(500);
                var container = document.getElementsByClassName('chat-conversation')[0].getElementsByClassName('simplebar-content-wrapper')[0];
                container.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" });
                $(_this).attr('data-last-message',(res.data.message[res.data.message.length-1])._id);
                $(_this).find('.unread-message .badge').text('');
                $.ajax({
                    type: 'POST',
                    url: BASE_URL+'api/updateLastSeenMessage',
                    data: {id:chat_user_id},
                    dataType: 'text'
                });
            },
            error: function (jqXHR, exception) {
                $('#chat-user-message-send-field').val('');
                toast_message_builder('danger','white',{header:'',time:'',data:JSON.parse(jqXHR.responseText).message});
            }
        });
    }
});

$('.chat-send').on('click',function (e) {
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: BASE_URL+'api/postmessage',
        data: {id:$('.chat-user-profile.active').attr('id').split('-').slice(-1)[0],message:{message:$('#chat-user-message-send-field').val()}},
        dataType: "text",
        success: function(res){
            res =  JSON.parse(res);
            self_message_builder({message:$('#chat-user-message-send-field').val(),date:Date.now()});
            var container = document.getElementsByClassName('chat-conversation')[0].getElementsByClassName('simplebar-content-wrapper')[0];
            container.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: "smooth" });
            $('#chat-user-message-send-field').val('');
            var clone = $('.chat-user-profile.active').clone();
            $(clone).find('.chat-user-last-message-time').text('now');
            $('.chat-user-profile.active').remove();
            $(clone).hide().prependTo("#chat-history-list").slideDown(500);
        },
        error: function (jqXHR, exception) {
            $('#chat-user-message-send-field').val('');
            toast_message_builder('danger','white',{header:'',time:'',data:JSON.parse(jqXHR.responseText).message});
        }
    });
})
$('#emoji-modal-btn').on('click',() => {
    $('#emoji-modal').modal('show');
})
//Mobile fix
$('.user-chat-header').on('click', '#chat-back-btn' ,() => {
    $('.user-chat.w-100').removeClass('user-chat-show')
})
