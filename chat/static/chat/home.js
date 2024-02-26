class Home {

    static init($elements , data) {
        this.$elements = $elements ;
        this.data = data ;
    }
   
    static loadFriendList(){
        $j.ajax(
            {
                url:'/api/my_rooms/',
                method:"GET",
                dataType:'json',
                success:function(data){
                    for(const room of data.room_list){

                        let photo = room.type=='user'? room.profile_photo : room.logo;
                        let $dataID = (room.type == 'user') ? `data-user-id="${room.id}"` : `data-group-id="${room.id}"`; 
                        
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
                        let  $roomItem = $j(friendngroupHtml);
                        Home.$elements.$friendnGroupList.append($roomItem);
                    }  
                    Home.attachEvent(Home.$elements.$friendnGroupList);

                },
                error:function(error){

                }
            }
        )
    }//func loadFriendds 


    static attachEvent($friendnGroupList) {
        $friendnGroupList.on('click', '.room-item', function (e) {
                                // Your click event logic here
                            let target = $j(e.currentTarget);
                            let room_type = target.data('room-type');
                            
                            let user_or_room_id = (room_type == 'user') ? target.data('user-id') : target.data('group-id');//this is user id incase of private chat 
                            let url_prefix = (room_type == 'user')? 'direct' : 'group';
                            
                            UrlRouter.visit(`/${url_prefix}/${user_or_room_id}/`)
        });
    }

    static load(){
        this.loadFriendList();
        this.$elements.$chatRoomContainerEl.empty();
    }
}