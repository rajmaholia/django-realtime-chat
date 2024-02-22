from django.urls import path 
from . import views 


app_name = 'chat'
urlpatterns = [
    path('',views.home,name='home'),
    path('search/',views.search , name = 'search'),
    path('settings/',views.settings,name='settings'),
    path('profile/<str:username>/',views.profile,name='profile'),
    path('group/<str:group_id>/detail/', views.group_detail , name='group_detail'),
    path('group/<str:group_id>/edit/', views.group_edit , name='group_edit'),

    #apis 
    path('api/my_rooms/',views.get_my_rooms),
    path('api/direct/get_or_create/<int:user_id>/',views.get_or_create_private_room),
    path('api/direct/<int:user_id>/',views.get_private_chat),
    path('api/group/create/',views.create_group),
    path('api/group/join/',views.join_group),
    path('api/group/<str:room_id>/',views.get_group_chat),
    path('api/get_my_friends/',views.get_my_friends),
]