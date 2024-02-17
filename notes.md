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
