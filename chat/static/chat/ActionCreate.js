    /* Handles Group create action */
    class ActionCreate {
        static $elements;
        static data = {name:'',selectedMembers:[]};

        static attachEvents() {
            this.$elements.$actionBtn.on('click',function(){
                ActionCreate.show();
                ActionCreate.loadList();
            })

            this.$elements.$cancelBtn.on('click',function(){
                ActionCreate.hide();
            });

            this.popUpEvents()
        }

        static show(){
            this.$elements.$targetEl.css('display','block');
        }

        static hide() {
            this.$elements.$targetEl.css('display','none');
        }

        static init($elements) {
            this.$elements = $elements;
            this.hide();
            this.attachEvents();
        }
        static loadList(){
            this.data.selectedMembers = [];
            this.$elements.$userListEl.empty()
            ActionCreate.getMyFriends()
                .then(data => {
                    for(const friend of data.friends) {
                        let $liItem = `<li class="d-flex bg-muted" data-user-id="${friend.user_id}"><span style="width:40px;height:40px;overflow:hidden" class="rounded-circle"><img class='w-100' style="object-fit:cover" src="${friend.profile_photo}"/></span>${friend.username}</li>`;
                        this.$elements.$userListEl.append($liItem)
                    }
                })
                .catch(error => {

                })
        }

        static async getMyFriends(){
            const url = `/api/get_my_friends/`;
            try {
                const data = await $j.ajax({
                    url:url,
                    method:'GET',
                    dataType:'json'
                });
                return data;
            } catch(error){
                throw error
            }
        }

        static popUpEvents(){
            this.$elements.$userListEl.on('click','li', function(e){
                let target = $j(e.currentTarget);
                let id = parseInt(target.data('user-id'));
                
                if(target[0].classList.contains('selected')) {
                    target.css('background-color','white');
                    target[0].classList.remove('selected');
                    let index = ActionCreate.data.selectedMembers.indexOf(id)
                    ActionCreate.data.selectedMembers.splice(index , 1)
                } else {
                    target.css('background-color','blue');
                    target[0].classList.add('selected');
                    ActionCreate.data.selectedMembers.push(id);
                }
            });

            
            this.$elements.$doneBtn.on('click',function(){
                
                let $input = ActionCreate.$elements.$groupNameInput;
                let members = ActionCreate.data.selectedMembers;

                let $groupNameErrorEl = $j('.cp-home-popup-create-group__groupname__errors');
                let $groupMembersErrorEl = $j('.cp-home-popup-create-group__selectusers__errors');

                let is_error = false ;
                if($input.val().trim().length == 0) {
                    $input.css('border-color','red')
                    $groupNameErrorEl.text('This field is required');
                    is_error = true;
                } 
                if(members.length == 0){
                    is_error = true;
                    $groupMembersErrorEl.text('Add atleast one member')
                } 
                if (!is_error){
                    let name = $input.val();
                    $j.ajax({
                            url:'/api/group/create/',
                            method:'POST',
                            data:{group_name:name,group_members:members},
                            success:function(data){
                                window.location.href = `/group/${data.id}/edit/`;
                            },
                            error:function(xhr, textStatus, errorThrown){
                                let _errors = xhr.responseJSON.errors;
                                let name_error = _errors?.group_name ?? '';
                                let member_error = _errors?.group_members ?? '';

                                $groupNameErrorEl.text(name_error);
                                $groupMembersErrorEl.text(member_error)
                            }
                        })
                }
            })

        }

    }