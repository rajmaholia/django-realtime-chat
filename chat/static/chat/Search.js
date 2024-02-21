class Search {
    static $searchInput;
    static $dataContainer;
    static $replacedData = null;
    static inFocus = false;
    static $searchCancelEl = null;
    static $searchFocusEl = null;
    
    static attachEvent(){

        this.$searchInput.on('focus',function(){
            let $suggestionBox = $j('<div class="cp-home-search-results-inner-box" id="suggestionBox"></div>');
            Search.$replacedData = Search.$dataContainer.html();
            Search.$dataContainer.empty()
            Search.$dataContainer.append($suggestionBox);
            Search.$searchCancelEl[0].classList.remove('cp-hide');
            Search.$searchFocusEl[0].classList.add('cp-hide');

            Search.$dataContainer[0].classList.remove('cp-hide')
            Search.$dataContainer.parent().css({
                'position':'relative'
            });
            Search.$dataContainer.css({
                'position':'absolute',
                'z-index':9,
                'top':'0%',
                'left':'0%',
                'background-color':'white',
                 'width':'100%',
                 'height':'100%'
            })
        });

        //when you enter in the search box 
        this.$searchInput.on('input', function () {
            let $suggestionBox = Search.$dataContainer.find('#suggestionBox');
            const query = $j(this).val();
            if (query.trim() === '') {
                $suggestionBox.html('');
                return;
            }

            fetch(`/search/?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    Search.displaySuggestions(data);
                });
        });//event-listener input 
        
        this.$searchCancelEl.on('click', function (event) {
                    Search.$dataContainer.html(Search.$replacedData);
                    Search.$searchInput.val('');
                    Search.$searchCancelEl[0].classList.add('cp-hide');
                    Search.$searchFocusEl[0].classList.remove('cp-hide');
                    Search.$dataContainer[0].classList.add('cp-hide');

         });//event-listener document

         if(this.$searchFocusEl){
            this.$searchFocusEl.on('click',function(){
                Search.$searchInput.focus();
            })
         }

    }// static AttachEvent 

    static displaySuggestions(suggestions) {
        let $suggestionBox = this.$dataContainer.find('#suggestionBox');
        $suggestionBox.html('');
        suggestions.forEach(suggestion => {
            
            let idRoom = (suggestion.type =='user') ? `data-user-id="${suggestion.id}"` : `data-room-id="${suggestion.id}"`;

            const $suggestionItem = $j(`<div data-room-type="${suggestion.type}"  ${idRoom} class="cp-home-search-suggestion-item" style="display:flex;style="border-bottom:1px solid grey"></div>`);
            
            let photo;
            if(suggestion.type == 'group') {
                photo = suggestion.logo
            } else {
                photo = suggestion.profile_photo
            }
            
            const suggestionItemHtml = `
                <div class="flex-shrink-0 m-0" >
                    <figure class="rounded-circle d-flex align-items-center p-0 m-0" style='width:40px;height:40px;overflow: hidden;'>
                        <img src="${photo}" alt="loading.." style="object-fit: cover;width:100%">
                    </figure>
                </div>
                <div class="flex-grow-1">
                    ${suggestion.name}
                </div>
                `;

                $suggestionItem.html(suggestionItemHtml);
                
                
            $suggestionBox.append($suggestionItem);             
        });//end foreach 
        Search.onItemClick($suggestionBox)
    }//end func displaySuggestions

    static onItemClick($suggestionBox){
            $suggestionBox.off('click');
            $suggestionBox.on('click', '.cp-home-search-suggestion-item', function (e) {
                                 // Your click event logic here
                                let target = $j(e.currentTarget);
                                let room_type = target.data('room-type');
                                let user_or_room_id = (room_type == 'user') ? target.data('user-id') : target.data('room-id');//this is user id incase of private chat 
                                let $chatContainer = $j(ChatArea.chatRoomContainer);
                                let username = ChatArea.username;
                                ChatArea.load({type:room_type,id:user_or_room_id},$chatContainer,username)
            });
    }

    static init(args) {
        this.$searchInput = args.$searchInput;
        this.$dataContainer = args.$dataContainer;
        this.$searchCancelEl = args.$searchCancelEl;
        this.$searchFocusEl = args.$searchFocusEl;
        this.attachEvent();
    }
}