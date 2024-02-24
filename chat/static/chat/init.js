$j(document).ready(function(){
    const username = JSON.parse($j('#json_username').text());
        const $searchInput = $j('#cpHomeSearchInput');
        const $searchResults = $j('.cp-home-search-results-container');//same 
        const $chatRoomContainerEl = $j('.cp-home-chatroom-container');//right side 
        
        //Intialize search handler 
        Search.init(
            {
                $searchInput:$searchInput,
                $dataContainer:$searchResults,
                $searchCancelEl:$j('.cp-home-search-cancel-icon'),
                $searchFocusEl:$j('.cp-home-search-focus-icon'),
            }
        );
        
        ActionCreate.init({
            $userListEl:$j('.cp-home-popup-create-group__selectusers__list'),
            $groupNameInput:$j('.cp-home-popup-create-group__groupname__input'),
            $doneBtn:$j('.cp-home-popup-create-group__done_btn'),
            $actionBtn :$j('.cp-home-bubble-action-create-group'),
            $cancelBtn :$j('.cp-home-popup-create-group__cancel'),
            $targetEl :$j('.cp-home-popup-create-group'),
        });

        ChatArea.setup({
            $container:$chatRoomContainerEl,
        },{
            username:username
        });     
})