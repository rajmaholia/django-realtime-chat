from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async 
import json 

from django.contrib.auth import get_user_model

from .models import GroupRoom , GroupMessage , PrivateRoom , PrivateMessage
from .utils import get_or_create_private_room 

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        kwargs = self.scope['url_route']['kwargs']
        if 'room_id' in kwargs:
            self.room_id = kwargs['room_id']
            self.room_group_name = f'chat_{self.room_id}'
            self.is_private = False
        else:
            room_id = kwargs['privateroom_id']
            self.is_private = True

            room  = await sync_to_async(PrivateRoom.objects.get)(id=room_id)
            self.room_id = room_id
            self.room_group_name = f'private_chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


    async def disconnect(self,code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self,text_data):
        data = json.loads(text_data)
        sender = data['username']
        message =  data['message']
        room_id = data['roomid']

        if self.is_private:
            receiver = data['receiver']
            await self.save_private_message(sender=sender,receiver=receiver,room=room_id,message=message)
        else:
            await self.save_message(sender,room_id,message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':'chat_messages',
                'sender':sender,
                'message':message,
                'room_id':room_id
            }
        )
    
    async def chat_messages(self,event):
        message = event['message']
        username = event['sender']
        room_id = event['room_id']

        await self.send(text_data=json.dumps({
            'message':message,
            'sender':username,
            'room_id':room_id
            }))
    
    @sync_to_async
    def save_message(self,username,room,message):
        user = User.objects.get(username=username)
        room = GroupRoom.objects.get(id=room)

        GroupMessage.objects.create(sender=user,room=room,content=message)

    @sync_to_async
    def save_private_message(self,sender,receiver , room,message):
        sender = User.objects.get(username = sender)
        receiver = User.objects.get(username = receiver)
        room = PrivateRoom.objects.get(id=room)
    
        PrivateMessage.objects.create(sender=sender,receiver=receiver,room=room,content=message)