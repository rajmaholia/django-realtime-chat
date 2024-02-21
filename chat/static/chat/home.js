class ChatArea {

    static username = null;
    static receiver = null;
    static room_id = null;
    static is_private = false;
    static activeConnection = null;
    static chatContainer = '.cp-home-chatroom-chatarea';
    static chatRoomContainer = '.cp-home-chatroom-container';
    static connected = false;

    static load(obj,$container,username){
                let room_type = obj.type ;
                let room_or_user_id  = obj.id;

                ChatManager.getConversation(room_type,room_or_user_id)
                    .then(data => {
                        $container.empty()
                        ChatArea.username = username;//static 
                       
                        let photo , name;
                        if(data.private_room) {
                            //if room is a private chat room .
                            photo = data.profile_photo;
                            name = data.receiver;
                            ChatArea.receiver = name;//static 
                        } else {
                            //if room  is a group 
                            photo = data.logo;
                            name = data.room_name;
                        }
                       
                        ChatArea.room_id = data.room_id;//static , nullable
                        ChatArea.is_private = data.private_room;//static 

                        let link = (room_type == 'user') ? `/profile/${username}/` : `/group/${data.room_id}/detail/`;
                        let $chatContent = $j(` 
                                        <div class="p-0 m-0 h-100">                      
                                            <nav class="cp-home-chatroom-top-navigation bg-primary px-1 navbar-light m-0 d-flex align-items-center">
                                                <a href="${link}" class="navbar-brand rounded-circle p-0 d-flex align-items-center " style="width:30px;height:30px;overflow:hidden">
                                                        <img src="${photo}" alt="img" style='object-fit:fill' class="img-fluid m-0 p-0 w-100 ">
                                                </a>
                                                <div class=''>${name}</div>
                                            </nav>

                                            <div class="cp-home-chatroom-chatarea m-0 p-1">
                                                    
                                            </div>
                                    
                                            <div class="cp-home-chatroom-bottom-message-area d-flex align-items-center m-0">
                                                <div class="input-group p-1">
                                                    <input type="text" name="message" class="form-control" id="cpRoomMessage">
                                                    <button class="btn btn-primary" id="cpRoomMessageSend">Send</button>
                                                </div>
                                            </div>
                                        <div>
                                        `);
                       
                            let $chatarea = $chatContent.find('.cp-home-chatroom-chatarea');

                            for(const message of data.messages){
                                let offset = '';
                                let textStyles = 'text-dark'
                                if(username == message.sender) {
                                    offset = 'justify-content-end';
                                    textStyles = 'bg-primary text-white'
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

                        //insert chatroom in the page 
                        $container.append($chatContent);
                    
                        //scroll chats to the bottom .
                        $chatarea[0].scrollTop = $chatarea[0].scrollHeight;


                        let receiver = (data.receiver) ? data.receiver : null;
                        let room_name = (data.room_name) ? data.room_name : null;
                        
                        //closes any active connection before opening new connection
                        if(ChatArea.activeConnection){ 
                            ChatManager.closeConnection();
                            ChatArea.activeConnection = null;
                        }
                        
                        if(data.room_id != null) {
                            let url_suffix = (room_type == 'user') ? `direct/${data.room_id}/` : `group/${data.id}/`;
                            let url = `ws://${window.location.host}/${url_suffix}`;

                            ChatManager.connect(url)
                                .then(chatSocket => {
                                    ChatArea.activeConnection = chatSocket;
                                    ChatArea.init({
                                        type: room_type,
                                        id: data.room_id,
                                        username: username,
                                        receiver: receiver,
                                        room_name: room_name,
                                        chatArea: $chatarea[0]
                                    });
                                })
                                .catch(error => {
                                    
                                })
                        }

                        //input field and send button 
                        let $input = $container.find('#cpRoomMessage');
                        let $btnSend = $container.find('#cpRoomMessageSend');
                        
                        $btnSend.on('click',function(e) {
                            if($input.val().trim().length != 0 ) {
                                
                                if(data.room_id == null && room_type == 'user'){
                                    ChatManager.getOrCreatePrivateRoom(data.receiver_id)
                                            .then(data => {
                                                ChatArea.room_id = data.room_id;
                                                ChatArea.init({
                                                    type: room_type,
                                                    id: data.room_id,
                                                    username: username,
                                                    receiver: receiver,
                                                    room_name: room_name,
                                                    chatArea: $chatarea[0]
                                                });
                                                
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
                        

                    })
                    .catch(error => {

                    }) 

    }//method load 

    static init(room){
            
            let roomName = room.room_name ;
            let is_private = (room.type=='user') ? true : false;
            let data = {
                    roomId:room.id,
                    username:room.username,
                    roomName:roomName,
                    privateRoom:is_private,
                    receiver:room.receiver,
                    chatArea:room.chatArea
                }
            
            ChatManager.init(data);
    }

}

$j(document).ready(function(){
        const username = JSON.parse($j('#json_username').text());
        const $searchInput = $j('#cpHomeSearchInput');
        const $searchResults = $j('.cp-home-search-results-container');//same 
        const $friendnGroupList = $j('.cp-home-user-and-group-list-container');//same
        const $chatRoomContainerEl = $j('.cp-home-chatroom-container');//right side 
        ChatArea.username = username;
        
        
        loadFriendList(username);

        //Intialize search handler 
        Search.init(
            {
                $searchInput:$searchInput,
                $dataContainer:$searchResults,
                $searchCancelEl:$j('.cp-home-search-cancel-icon'),
                $searchFocusEl:$j('.cp-home-search-focus-icon'),
            }
        );

        
        function loadFriendList(username){
            let dataObj;
            $j.ajax(
                {
                    url:'/my_rooms/',
                    method:"GET",
                    dataType:'json',
                    success:function(data){
                        dataObj = data;
                        for(const room of data.room_list){
                            let photo = room.type=='user'? room.profile_photo : room.logo;
                            let $dataID = (room.type == 'user') ? `data-user-id="${room.id}"` : `data-room-id="${room.id}"`; 
                            let friendngroupHtml = `
                                <div class="d-flex room-item" ${$dataID} data-room-type="${room.type}">
                                    <div class="flex-shrink-0 py-1 m-0 d-flex align-items-center" >
                                        <figure class="rounded-circle d-flex align-items-center m-0" style='width:40px;height:40px;overflow: hidden;'>
                                            <img src="${photo}" alt="loading.." style="object-fit: cover;width:100%">
                                        </figure>
                                    </div>
                                    <div class="flex-grow-1 ms-3 " style="border-bottom:1px solid grey">
                                        ${room.name}
                                    </div>
                                </div>
                                `;
                                $roomItem = $j(friendngroupHtml);
                            $friendnGroupList.append($roomItem);
                        }  
                        attachEvent($friendnGroupList);

                    },
                    error:function(error){

                    }
                }
            )
        }//func loadFriendds 

        function attachEvent($friendnGroupList) {
                $friendnGroupList.on('click', '.room-item', function (e) {
                                        // Your click event logic here
                                    let target = $j(e.currentTarget);
                                    let room_type = target.data('room-type');
                                    let user_or_room_id = (room_type == 'user') ? target.data('user-id') : target.data('room-id');//this is user id incase of private chat 
                                    ChatArea.load({type:room_type,id:user_or_room_id},$chatRoomContainerEl,username)
                                });
        }
});//callback ready 
