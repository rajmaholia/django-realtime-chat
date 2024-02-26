from .models import PrivateRoom
from django.db.models import Q

def get_or_create_private_room(user1, user2):
    room = PrivateRoom.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first()
    created = False
    if not room:
        room = PrivateRoom.objects.create(user1=user1, user2=user2)
        created = True

    return room , created

def get_private_room(user1,user2):
    room = PrivateRoom.objects.filter(Q(user1=user1 , user2=user2) | Q(user1=user2 , user2=user1)).first()
    return room 


# def add_to_friends(user1 , user2):
#     try:
#         user1.friends.add(user=user2)
#         user2.friends.adds(user=user1)
#         return {'status':'success','messege':f'{user1.username} and {user2.username} become friends.'}


#     except User.DoesNotExist as e:
#         return {'status':'error','reason':f'{str(e)}'}

