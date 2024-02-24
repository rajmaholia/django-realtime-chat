from django import forms 
from .models import ChatUser , GroupRoom

class GroupRoomForm(forms.ModelForm):
    class Meta:
        model = GroupRoom
        fields = ['name', 'logo', 'members','admins'] 

class ProfileForm(forms.ModelForm):
    class Meta:
        model = ChatUser 
        fields = ('profile_photo','fullname','bio')
