from .models import PrivateRoom
from django.db.models import Q

def get_or_create_private_room(user1, user2):
    room = PrivateRoom.objects.filter(Q(user1=user1, user2=user2) | Q(user1=user2, user2=user1)).first()
    if not room:
        room = PrivateRoom.objects.create(user1=user1, user2=user2)
    return room
