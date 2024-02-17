from django.contrib import admin
from .models import GroupRoom , GroupMessage , PrivateMessage , PrivateRoom , ChatUser

# Register your models here.
admin.site.register([ChatUser, GroupRoom, GroupMessage , PrivateMessage , PrivateRoom])

