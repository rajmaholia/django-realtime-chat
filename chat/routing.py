from django.urls import path 
from .consumers import ChatConsumer

websocket_urlpatterns = [
    path('group/<str:room_id>/',ChatConsumer.as_asgi()),
    path('direct/<str:privateroom_id>/',ChatConsumer.as_asgi())
]