from django.db import models
from django.contrib.auth import get_user_model

import uuid 

User = get_user_model()
# Create your models here.


class ChatUser(models.Model):
    id = models.UUIDField(primary_key = True , default = uuid.uuid4)
    user = models.OneToOneField(User,related_name='chatuser',on_delete=models.CASCADE)
    profile_photo = models.ImageField(upload_to='profile_photos/',default='blank_profile_photo.png')
    is_active = models.BooleanField(default=False)
    fullname = models.CharField(max_length=100, default='')
    bio = models.TextField(default='')
    friends = models.ManyToManyField(User,related_name='reverse_friends_chatusers')

    def __str__(self):
        return self.user.username

class GroupRoom(models.Model):
    id = models.UUIDField(primary_key=True , default=uuid.uuid4)
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='group_logos/',default='blank_group_logo.jpg')
    creator = models.ForeignKey(User,on_delete=models.CASCADE , related_name='group_rooms_2')
    admins = models.ManyToManyField(User)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User,related_name='group_rooms')

    def __str__(self):
        return self.name 

class GroupMessage(models.Model):
    room = models.ForeignKey(GroupRoom,related_name='messages',on_delete=models.CASCADE)
    sender = models.ForeignKey(User,related_name='messages',on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.room.name}({self.sender.username} : {self.content})'
    
    class Meta: 
        ordering = ('created_at',)


class PrivateRoom(models.Model):
    id = models.UUIDField(primary_key = True,default=uuid.uuid4)
    user1 = models.ForeignKey(User, related_name='private_rooms_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='private_rooms_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'PrivateRoom({self.user1} and {self.user2})'
    

class PrivateMessage(models.Model):
    room = models.ForeignKey(PrivateRoom,related_name='messages',on_delete=models.CASCADE)
    sender = models.ForeignKey(User,related_name='private_messages',on_delete=models.CASCADE)
    receiver = models.ForeignKey(User,on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.room}({self.sender.username} : {self.content})'
    
    class Meta: 
        ordering = ('created_at',)

