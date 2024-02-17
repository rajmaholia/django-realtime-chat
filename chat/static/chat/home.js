class ChatArea {

    static username = null;
    static receiver = null;
    static room_id = null;
    static is_private = false;
    static activeConnection = null;
    static chatContainer = '.cp-home-chatroom-chatarea';
    static chatRoomContainer = '.cp-home-chatroom-container';

    static load(obj,$container,username){
                ChatManager.getConversation(obj.type,obj.id)
                    .then(data => {
                        $container.empty()
                       
                        ChatArea.username = username;//static 
                       
                        let photo , name;
                        if(data.private_room) {
                            photo = data.profile_photo;
                            name = data.receiver;
                            ChatArea.receiver = name;//static 
                        } else {
                            photo = data.logo;
                            name = data.room_name;
                        }
                       
                        ChatArea.room_id = data.room_id;//static 
                        ChatArea.is_private = data.private_room;

                        

                        let $chatContent = $j(` 
                                        <div class="p-0 m-0 h-100">                      
                                            <nav class="cp-home-chatroom-top-navigation navbar bg-primary px-1 navbar-light m-0 d-flex">
                                                <a href="" class="navbar-brand rounded-circle p-0 d-flex align-items-center " style="width:30px;height:30px;overflow:hidden">
                                                        <img src="${photo}" alt="img" style='object-fit:fill' class="img-fluid m-0 p-0 w-100 ">
                                                </a>
                                                <div class=''>${name}</div>
                                            </nav>

                                            <div class="cp-home-chatroom-chatarea m-0 ">
                                                    
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
                        $container.append($chatContent);
                        $chatarea[0].scrollTop = $chatarea[0].scrollHeight;
                        let receiver = (data.receiver) ? data.receiver : null;
                        let room_name = (data.room_name) ? data.room_name : null;
                        
                        //closes any active connection before opening new connection
                        if(ChatArea.activeConnection){ 
                            ChatManager.closeConnection();
                        }
                        let webSocketConnection = ChatArea.connectSocket({type:obj.type, id:data.room_id, username:username, receiver:receiver ,room_name:room_name,chatArea:$chatarea[0]});
                        
                        ChatArea.activeConnection = webSocketConnection;

                        let $input = $container.find('#cpRoomMessage');
                        let $btnSend = $container.find('#cpRoomMessageSend');
                        
                        $btnSend.on('click',function(e) {
                            if($input.val().trim().length != 0 ) {
                                ChatManager.send({
                                    message: $input.val(),
                                    username:username,
                                    receiver:receiver
                                });
                                $input.val('');
                            }
                        });
                        

                    })
                    .catch(error => {

                    }) 

    }//method load 

    static connectSocket(room){
        
        try {
            let url_suffix = (room.type == 'user') ? `direct/${room.id}/` : `group/${room.id}/`;
            let is_private = (room.type == 'user') ? true : false;
            let roomName = room.room_name ;

            let data = {
                    roomId:room.id,
                    username:room.username,
                    roomName:roomName,
                    privateRoom:is_private,
                    receiver:room.receiver,
                    url:`ws://${window.location.host}/${url_suffix}`,
                    chatArea:room.chatArea
                }
            
            const chatSocket = ChatManager.init(data);

            return chatSocket;
        } catch(error){
            console.log(error)
        }
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
