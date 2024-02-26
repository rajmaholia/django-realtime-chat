class ChatArea {

    static receiver = null;
    static room_id = null;
    static is_private = false;
    static activeConnection = null;
    static is_member  = false;

    static $elements = null;
    static data = null;

    static load(obj){
                let room_type = obj.type ;
                let room_or_user_id  = obj.id;
                let $container =  this.$elements.$container;
                let username = this.data.username;

                ChatManager.getConversation(room_type,room_or_user_id)
                    .then(data => {
                        $container.empty()
                       
                        let photo , name , is_group , is_member;
                        if(data.private_room) {
                            //if room is a private chat room .
                            photo = data.profile_photo;
                            name = data.receiver;
                            ChatArea.receiver = name;//static 
                        } else {
                            //if room  is a group 
                            photo = data.logo;
                            name = data.room_name;
                            is_member = data.is_member ;
                            is_group = true;
                        }
                       
                        ChatArea.room_id = data.room_id;//static , nullable
                        ChatArea.is_private = data.private_room;//static 

                        let link = (room_type == 'user') ? `/profile/${name}/` : `/group/${data.room_id}/detail/`;
                        let $chatContent = $j(` 
                                        <div class="p-0 m-0 h-100">                      
                                            <nav class="cp-home-chatroom-top-navigation bg-primary px-1 m-0 d-flex align-items-center">
                                                <button class="btn btn-primary cp-home-chatroom-top-navigation__btn-back d-sm-none"><i class="fa-solid fa-arrow-left"></i></button>
                                                <a href="${link}" class="rounded-circle p-0 d-flex align-items-center " style="width:30px;height:30px;overflow:hidden">
                                                        <img src="${photo}" alt="img" style='object-fit:fill' class="img-fluid m-0 p-0 w-100 ">
                                                </a>
                                                <div class=''>${name}</div>
                                            </nav>

                                            <div class="cp-home-chatroom-chatarea m-0 p-1">
                                                    
                                            </div>
                                    
                                            <div class="cp-home-chatroom-bottom-message-area d-flex align-items-center m-0">
                                                <div class="input-group p-1 cp-home-chatroom-bottom-message-area__message">
                                                    <input type="text" name="message" class="form-control" id="cpRoomMessage">
                                                    <button class="btn btn-primary" id="cpRoomMessageSend">Send</button>
                                                </div>
                                                <div class="p-1 w-100 cp-home-chatroom-bottom-message-area__join">
                                                    <button class="btn btn-primary w-100" id="cpRoomGroupJoin">Join</button>
                                                </div>
                                            </div>
                                        <div>
                                        `);

                            let $cpMessegeEl = $chatContent.find('.cp-home-chatroom-bottom-message-area__message');
                            let $cpGroupJoin = $chatContent.find('.cp-home-chatroom-bottom-message-area__join');
                            $cpGroupJoin.css('display','none');
                            let $chatarea = $chatContent.find('.cp-home-chatroom-chatarea');
                            
                            if(is_group) {
                                ChatArea.showGroupChat(data.messages , $chatarea);
                                if(is_member) {
                                    $cpGroupJoin.css('display','none');
                                    $cpMessegeEl.css('display','flex');
                                } else  {
                                    $cpMessegeEl.css('display','none');
                                    $cpGroupJoin.css('display','block');
                                }
                            } else {
                                ChatArea.showPersonalChat(data.messages , $chatarea);
                            }


                            

                        //insert chatroom in the page 
                        $container.append($chatContent);
                        $container[0].classList.add('cp-place-left-on-sm');
                    
                        //scroll chats to the bottom .
                        $chatarea[0].scrollTop = $chatarea[0].scrollHeight;


                        let receiver = (data.receiver) ? data.receiver : null;
                        let room_name = (data.room_name) ? data.room_name : null;
                        
                        //closes any active connection before opening new connection
                        if(ChatArea.activeConnection){ 
                            ChatManager.closeConnection();
                            ChatArea.activeConnection = null;
                        }
                        
                        //contains common data for the room
                        let roomData = {
                            username: ChatArea.data.username,
                            receiver: receiver,
                            roomName: room_name,
                            chatArea: $chatarea[0],
                        };

                        if(data.room_id != null) {
                            let url_suffix = (room_type == 'user') ? `direct/${data.room_id}/` : `group/${data.room_id}/`;
                            let url = `ws://${window.location.host}/${url_suffix}`;
                            let privateRoom = (room_type == 'user') ? true : false;

                            roomData.roomId = data.room_id;
                            roomData.privateRoom = privateRoom;

                            ChatManager.init(roomData);

                            ChatManager.connect(url)
                                .then(chatSocket => {
                                    ChatArea.activeConnection = chatSocket;
                                })
                                .catch(error => {
                                    console.log(error)
                                })
                        }

                        //Back btn 
                        let $btnBack = $j('.cp-home-chatroom-top-navigation__btn-back');
                        $btnBack.on('click',function(){
                            UrlRouter.visit('/');
                            $container[0].classList.remove('cp-place-left-on-sm')
                        });
                        
                        //input field and send button 
                        let $input = $container.find('#cpRoomMessage');
                        let $btnSend = $container.find('#cpRoomMessageSend');
                        
                        $btnSend.on('click',function(e) {
                            if($input.val().trim().length != 0 ) {
                                
                                if(data.room_id == null && room_type == 'user'){
                                    ChatManager.getOrCreatePrivateRoom(data.receiver_id)
                                            .then(data => {
                                                ChatArea.room_id = data.room_id;
                                                roomData.roomId = data.room_id;
                                                
                                                let privateRoom = (room_type == 'user') ? true : false;
                                                roomData.privateRoom = privateRoom;
                                                roomData.roomId = data.room_id;

                                                ChatManager.init(roomData);
                                                
                                                /* connection handling */
                                                let url_suffix = `direct/${data.room_id}/`
                                                let url = `ws://${window.location.host}/${url_suffix}`;

                                                ChatManager.connect(url)
                                                    .then(chatSocket => {
                                                        ChatArea.activeConnection = chatSocket;
                                                        ChatManager.send({
                                                            message: $input.val(),
                                                            username: username,
                                                            receiver: receiver
                                                        });
                                                        $input.val('');
                                                    })
                                                    .catch(error => {

                                                    });

                                            })
                                            .catch(error => {
                                                console.error("Error getting or creating private room:", error);
                                            });
                                } else {
                                    ChatManager.send({
                                        message: $input.val(),
                                        username: username,
                                        receiver: receiver
                                    });
                                    $input.val('');
                                }
                                
                            }
                        });//btn send 
                        
                        $cpGroupJoin.on('click',function(){
                            if(data.room_type='group'){
                                let group_room_id = data.room_id;
                                ChatManager.joinGroup(group_room_id)
                                    .then(response=> {
                                        if(response.status == 'success') {
                                            
                                            const url = `ws://${window.location.host}/group/${group_room_id}/`;
                                            
                                            ChatManager.connect(url)
                                                .then(chatSocket=> {
                                                    ChatArea.activeConnection = chatSocket;
                                                }).catch(error => {
                                                
                                                });

                                            $cpGroupJoin.css('display','none');
                                            $cpMessegeEl.css('display','flex');
                                        }
                                    })
                                    .catch(error=>{
                                        console.log(error)
                                    });
                            }
                        })

                    })
                    .catch(error => {

                    }) 

    }//method load 

    static showGroupChat(messages , $chatarea){
        for(const message of messages){
            
            let offset = '';
            let textStyles = 'text-dark';
            let header = '';
            
            if(ChatArea.data.username == message.sender) {
                offset = 'justify-content-end';
                textStyles = 'bg-primary text-white';
                header = '';
            } else {
                header = `<div class="card-header p-0 px-1 border-0 bg-transparent text-muted m-0 " style="font-size: 12px;">
                            ${message.sender}               
                          </div>`;
            }

            $chatarea.append($j(`
                <div class="d-flex ${offset}">
                        <div class="cp-room-chat card mb-1 ${textStyles}">
                            ${header}
                            <div class="card-body px-1 p-0 m-0 cp-room-chat-message">
                                ${ message.content }
                            </div>
                        </div>
                </div>`)
            );
        }
    }

    static showPersonalChat(messages , $chatarea){
        for(const message of messages){
            
            let offset = '';
            let textStyles = 'text-dark';
            
            if(ChatArea.data.username == message.sender) {
                offset = 'justify-content-end';
                textStyles = 'bg-primary text-white';
            }

            $chatarea.append($j(`
                <div class="d-flex ${offset}">
                        <div class="cp-room-chat card mb-1 ${textStyles}">
                            <div class="card-body px-1 p-0 m-0 cp-room-chat-message">
                                ${ message.content }
                            </div>
                        </div>
                </div>`)
            );
        }
    }

    static setup($elements , data) {
        this.$elements = $elements;
        this.data = data;
    }

}