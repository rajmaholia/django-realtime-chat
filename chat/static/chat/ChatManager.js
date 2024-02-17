class ChatManager {
    static roomName = null;
    static username = null;//required
    static roomId = null;//required
    static chatArea = null;//required
    static chatSocket = null;
    static privateRoom = false;
    
    /**
     * Creates a connection to the websocket and handles onmessage,onclose and onerror events . 
     * 
     * @param {string} url - websocket url for chat room.
     * @returns {WebSocket} - Returns websocket connection Object.
     */
    static connect(url){
        try {
            const chatSocket = new WebSocket(url);
            ChatManager.chatSocket = chatSocket;
            
            chatSocket.onmessage = ChatManager.onMessage;
            chatSocket.onclose = ChatManager.onClose;
            chatSocket.onerror = ChatManager.onError;
            return chatSocket;
        } catch(error){
            console.error('WebSocket connection error:', error);
        }
    }

    static closeConnection(){
        if(this.chatSocket && this.chatSocket.readyState == WebSocket.OPEN) {
            this.chatSocket.close();
            console.log("connection closed")
        } else {
             console.log('wesocket connection is not open .')
        }
    }

    /**
     * CallBack function to handle Messege Event .
     *  
     * This is called by this.connect(). 
     * 
     * @param {MessageEvent} e - MessegeEvent Object 
     */
    static onMessage(e){
        const data = JSON.parse(e.data);
        let chatOffset = '';
        let chatStyles = 'text-dark';
        if(data.sender==ChatManager.username) {
            chatOffset = 'justify-content-end';
            chatStyles = 'bg-primary text-white';
        }
        
        let chatHeader = ' '
        if (!ChatManager.privateRoom){
            chatHeader = `<div class="card-header p-0 px-1 border-0 bg-transparent text-muted m-0 " style="font-size: 12px;">
                            ${data.sender}                   
                        </div>`
        }
        ChatManager.chatArea.innerHTML += ` 
        <div class="d-flex ${chatOffset}">
            <div class="cp-room-chat  card mb-1 ${chatStyles}">
                ${chatHeader}
                <div class="card-body px-1 p-0 m-0 chat-message">
                    ${data.message}
                </div>
            </div>
        </div>       
        `;
        ChatManager.chatArea.scrollTop = ChatManager.chatArea.scrollHeight;
    }

    /**
     * Callback , when the connection to current room is closed .
     * 
     * @param {CloseEvent} event 
     */
    static onClose(event){
        if (event.wasClean) {
            //console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            //console.error('Connection died');
        }
    }


    static onError(error){

    }

    /**
     * 
     * @param {object} data - data must have roomId,username,messege and receiver (in case of Personal Chat) .
     */
    static send(data){ 
        
        if (ChatManager.chatSocket.readyState === WebSocket.OPEN) {
            // Set default values for roomid and username if not provided in the data
            data.roomid = data.roomId || ChatManager.roomId;
            data.username = data.username || ChatManager.username;
            
            // Send the message by converting data to JSON string
            ChatManager.chatSocket.send(JSON.stringify(data));
        } else {
            // Log an error message to the console if the connection is not open
            console.error('WebSocket connection is not open.');
        }
    }


    /**
     * Initialize the ChatManager and provide data need .
     * 
     * @param {object} data 
     * @returns {WebSocket}
     */
    static init(data){
        ChatManager.roomName = data.roomName || ChatManager.roomName;
        ChatManager.roomId = data.roomId || ChatManager.roomId;
        ChatManager.chatArea = data.chatArea || ChatManager.chatArea;
        ChatManager.username = data.username;
        ChatManager.privateRoom = data.privateRoom || ChatManager.privateRoom;
        
        return ChatManager.connect(data.url)
    }

    static async getConversation(type,id){
        
        const url = (type =='user') ? `/api/direct/${id}/` : `/api/group/${id}/`;
        try {
            const data = await $j.ajax({
                url:url,
                method:"GET",
                dataType:'json',
            });
            return data;
        } catch(error){
            throw error;
        }
    }
}
