from django import forms 
from .models import ChatUser


class ProfileForm(forms.ModelForm):
    class Meta:
        model = ChatUser 
        fields = ('profile_photo','fullname','bio')