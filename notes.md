# notes for chat_project

1. changing fa-icon behaviour.
    - when Using font-awesome class an svg is place automatically before th `<i>` tag .
    - **That Means I try to do some code on tag , Icon is not gonna change**
    - **This can be changed only using css. Using the .fa-<...> or giving a class to `.xyz`**
    - EG. I
        - n Icon `<i.fa-icon.test>` , if we try to hide this icon , we can use JS , JQuery .
        - But after than making this icon visible JS will not work .
        - for that we will give the icon a class lets- say `.test` in that case , we have now toggle this class to apply `d-none`.

2. How to use django template context value .
    - Take an example i have a object `user`.
    - & now i want to user username value in the JS .
    - `{{user.username|json_script:'json_username'}}`.
    - This Creates `<script id="json_username">Raj</script>`.
    - Now get this value using `$('#json_username).text();` and use it .

3. styling Scroll Bar .
    - The Code .

     ```python
     
        .cp-room-chat-area::-webkit-scrollbar{
            width: 5px;
        }

        .cp-room-chat-area::-webkit-scrollbar-thumb {
            background-color: #6c757d; /* Set the color of the scrollbar thumb */
            border-radius: 10px; /* Set the border radius of the thumb */
        }

        .cp-room-chat-area::-webkit-scrollbar-track {
            background-color: #f8f9fa; /* Set the color of the scrollbar track */
            border-radius: 10px; /* Set the border radius of the track */
        }

        .cp-room-chat-area::-webkit-scrollbar-thumb:hover {
            background-color: #495057; /* Set the color of the scrollbar thumb on hover */
        }

        .cp-room-chat-area::-webkit-scrollbar-thumb:active {
            background-color: #343a40; /* Set the color of the scrollbar thumb on click */
        }
        ```

3.working with websockets.
    - create websocket `let socket = new WebSocket(url)`
    - In the situation the url is like : `let url = ws://window.location.host/chat/<room_id>/`
    - apply events like `socket.onmessage`, `socket.onclose` , `socket.onerror`.
    - To close the connection use `socket.close()` but this is better to check whether the connection is `OPEN`.
    - To check whether the connection is open use  `socket.readyState == WebSocket.OPEN`.

4.Set related name in the models.
    - just took the following example .
    ```python
    field1 = models.ForeignKey(User,related_name='test_name')
    field2 = models.ForeignKey(User,related_name='test_name')
    ```
    - This will be an error , related name cannot be same for two different Foreignkey that uses the same model,
    - Either change the related_name or remove from one ,
    - Default related_name for the Relations is `<model_name>_set` in this case `User.<model_name>_set` .
    - NOTE :  `User.test_name` can be used to refer only one model .
    - just view these examples :

    ```python
    class Message(Model):
        sender = models.ForeignKey(User,related_name='messages')
    
    class PrivateMessage(Model):
        sender = models.ForeignKey(User, related_name='private_messages')
    
    //related_name = 'messages' will be an error .
    ```

5.Promise in javascript .
    - Create Promise .
    ```javascript
    new Promise((resolve, reject)=> {
        resolve(),
        reject()
    })
    how to call this .
    PromiseObj()
    .then(data => {
    })
    .catch(error => {
    })
    ```
    for example .
    ```javascript
    function connect(url) {
        return new Promise((resolve, reject) => {
            try {
                const chatSocket = new WebSocket(url);
                ChatManager.chatSocket = chatSocket;
                chatSocket.onmessage = ChatManager.onMessage;
                chatSocket.onclose = ChatManager.onClose;
                chatSocket.onerror = ChatManager.onError;
                // Resolve the promise once the WebSocket connection is open
                chatSocket.onopen = () => {
                    resolve(chatSocket);
                };
            } catch (error) {
                console.error('WebSocket connection error:', error);
                reject(error);
            }
        });
    }
    connect(url)
    .then(chatSocket => {
    })
    .catch(error => {
    })
    ```

6.Django(making code in async context)
    - if some code is blocking the async way it will be an error during runtime .
    - so you have to make the code async as follow :
    ```python
    user = User.objects.get(id=id)#error
    user = await sync_to_async(User.objects.get)(id=id)
    #or create a function like that :
    @sync_to_async
    def get_user(id):
        return User.objects.get(id=id)
    ```
