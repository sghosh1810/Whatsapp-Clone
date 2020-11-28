function searchChatContacts() {
    $.ajax({
        url: `${BASE_URL}api/getchatscontacts?name=${$('#contact-search').val()}`,
        success: function(res) {
            var data = res.data;
            $('#chat-history-list').empty();
            if(Object.keys(data).length) {
                data.forEach(element => {
                    let status_message = element.status;
                    let profile_picture = 'user_files/profile_images/'+element.profileImage;
                    let user_status = (element.status)?'':element.status;
                    $('#chat-history-list').append(
                        `<li>
                            <a href="#">
                                <div class="media">
                                    <div class="chat-user-img ${user_status} align-self-center mr-3">
                                        <img src="${profile_picture}" class="rounded-circle avatar-xs" alt="">
                                        <span class="user-status"></span>
                                    </div>
                                    <div class="media-body overflow-hidden">
                                        <h5 class="text-truncate font-size-15 mb-1"> ${element.name} </h5>
                                        <p class="chat-user-message text-truncate mb-0"> ${status_message} </p>
                                    </div>
                                    <div class="font-size-11">05 min</div>
                                </div>
                            </a>
                        </li>`
                    );
                });
            } else {
                $('#chat-history-list').append('<div class="px-3 dir="ltr"><div> No such contact,group or chat found! </div></div>');
            }
        },
        error: function (jqXHR, exception) {
            $('#chat-user-message-send-field').val('');
            toast_message_builder('danger','white',{header:'',time:'',data:JSON.parse(jqXHR.responseText).message});
        }
    })
}
function generate_random_id() {
    return Math.random().toString(36).substr(2, 9);
}
function toast_message_builder(toast_class,toast_text_class,toast,display_time) {
    display_time = display_time || 3000;
    var random_id_for_class = generate_random_id();
    $('#toast-notification').append(`
        <div id="toast-notification-${random_id_for_class}" class="toast ml-auto" role="alert" style="z-index: 999; top: 10%;">
            <div class="bg-${toast_class} toast-header">
                <strong class="mr-auto text-${toast_text_class}">${toast.header}</strong>
                <small class="text-${toast_text_class}">${toast.time}</small>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="bg-${toast_class} toast-body text-${toast_text_class}"> ${toast.data} </div>
        <div>
    `);
    $('#toast-notification-'+random_id_for_class).toast({delay:display_time});
    $('#toast-notification-'+random_id_for_class).toast("show");
    setTimeout(() => {
        $('#toast-notification-'+random_id_for_class).remove();
    }, display_time);
}
function getMinutesBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
}
function getDate(date) {
    var formatted_datetime="";
    var d = new Date(parseInt(date));
    formatted_datetime += d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    return formatted_datetime;
}
function chat_section_builder(messages,user_details,curr_user_id) {
    messages.forEach(message => {
        if(message.sender_id != curr_user_id) {
            $('.list-unstyled.mb-0').append(`
                <li>
                    <div class="conversation-list">
                        <div class="chat-avatar">
                            <img src="${user_details.profileImage}" alt="">
                        </div>

                        <div class="user-chat-content">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0">
                                        ${message.message}
                                    </p>
                                    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">${getDate(message.date)}</span></p>
                                </div>
                                <div class="dropdown align-self-start">
                                    <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="ri-more-2-fill"></i>
                                    </a>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Save <i class="ri-save-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-right text-muted"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="conversation-name">${user_details.name}</div>
                        </div>
                    </div>
            </li>`);
        } else {
            $('.list-unstyled.mb-0').append(`
                <li class="right">
                    <div class="conversation-list">
                        <div class="chat-avatar">
                            <img src="${$('.rounded-circle.avatar-lg.img-thumbnail,.profile-user.rounded-circle').attr('src')}" alt="">
                        </div>

                        <div class="user-chat-content">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0">
                                        ${message.message}
                                    </p>
                                    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">${getDate(message.date)}</span></p>
                                </div>
                                    
                                <div class="dropdown align-self-start">
                                    <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="ri-more-2-fill"></i>
                                    </a>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Save <i class="ri-save-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-right text-muted"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="conversation-name">${$('#profile-name').text()}</div>
                        </div>
                    </div>
                </li>`);
        }
    });
}
function self_message_builder(message) {
    $('.list-unstyled.mb-0').append(`
                <li class="right">
                    <div class="conversation-list">
                        <div class="chat-avatar">
                            <img src="${$('.rounded-circle.avatar-lg.img-thumbnail,.profile-user.rounded-circle').attr('src')}" alt="">
                        </div>

                        <div class="user-chat-content">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0">
                                        ${message.message}
                                    </p>
                                    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">${getDate(message.date)}</span></p>
                                </div>
                                    
                                <div class="dropdown align-self-start">
                                    <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="ri-more-2-fill"></i>
                                    </a>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Save <i class="ri-save-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-right text-muted"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="conversation-name">${$('#profile-name').text()}</div>
                        </div>
                    </div>
                </li>`);
}
function friend_message_builder(message,user_details){
    $('.list-unstyled.mb-0').empty();
    $('.list-unstyled.mb-0').append(`
                <li>
                    <div class="conversation-list">
                        <div class="chat-avatar">
                            <img src="${user_details.profileImage}" alt="">
                        </div>

                        <div class="user-chat-content">
                            <div class="ctext-wrap">
                                <div class="ctext-wrap-content">
                                    <p class="mb-0">
                                        ${message.message}
                                    </p>
                                    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i> <span class="align-middle">${getDate(message.date)}</span></p>
                                </div>
                                <div class="dropdown align-self-start">
                                    <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="ri-more-2-fill"></i>
                                    </a>
                                    <div class="dropdown-menu">
                                        <a class="dropdown-item" href="#">Copy <i class="ri-file-copy-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Save <i class="ri-save-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Forward <i class="ri-chat-forward-line float-right text-muted"></i></a>
                                        <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-right text-muted"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div class="conversation-name">${user_details.name}</div>
                        </div>
                    </div>
            </li>`);
}
function chat_section_wrapper_builder(user_details) {
    $('.user-chat-header').append(`<div class="row align-items-center">
    <div class="col-sm-8 col-8">
        <div class="media align-items-center">
            <div class="d-block d-lg-none mr-2">
                <a href="javascript: void(0);" class="user-chat-remove text-muted font-size-16 p-2"><i class="ri-arrow-left-s-line"></i></a>
            </div>
            <div class="mr-3">
                <img src="${user_details.profileImage}" class="rounded-circle avatar-xs" alt="">
            </div>
            <div class="media-body overflow-hidden">
                <h5 class="font-size-16 mb-0 text-truncate"><a href="#" class="text-reset user-profile-show">${user_details.name}</a> <i class="ri-record-circle-fill font-size-10 text-success d-inline-block ml-1"></i></h5>
            </div>
        </div>
    </div>
    <div class="col-sm-4 col-4">
        <ul class="list-inline user-chat-nav text-right mb-0">
            
            <li class="list-inline-item">
                <div class="dropdown">
                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="ri-search-line"></i>
                    </button>
                    <div class="dropdown-menu p-0 dropdown-menu-right dropdown-menu-md">
                        <div class="search-box p-2">
                            <input type="text" class="form-control bg-light border-0" placeholder="Search..">
                        </div>
                    </div>
                </div>
            </li>

            <li class="list-inline-item d-none d-lg-inline-block">
                <button type="button" class="btn nav-btn user-profile-show">
                    <i class="ri-user-2-line"></i>
                </button>
            </li>

            <li class="list-inline-item">
                <div class="dropdown">
                    <button class="btn nav-btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="ri-more-fill"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                        <a class="dropdown-item d-block d-lg-none user-profile-show" href="#">View profile <i class="ri-user-2-line float-right text-muted"></i></a>
                        <a class="dropdown-item" href="#">Archive <i class="ri-archive-line float-right text-muted"></i></a>
                        <a class="dropdown-item" href="#">Muted <i class="ri-volume-mute-line float-right text-muted"></i></a>
                        <a class="dropdown-item" href="#">Delete <i class="ri-delete-bin-line float-right text-muted"></i></a>
                    </div>
                </div>
            </li>
            
        </ul>
    </div>
</div>`);
}