from django.urls import path 
from . import views 


app_name = 'chat'
urlpatterns = [
    path('',views.home,name='home'),
    path('search/',views.search , name = 'search'),
    path('settings/',views.settings,name='settings'),
    path('profile/<str:chatuser_id>/',views.profile,name='profile'),

    #apis 
    path('my_rooms/',views.get_my_rooms),
    path('api/direct/<int:user_id>/',views.get_private_chat),
    path('api/group/<str:room_id>/',views.get_group_chat),

]