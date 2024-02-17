from django.forms import ModelForm
from .models import ChatUser 


class ProfileForm(ModelForm):
    class Meta:
        model = ChatUser 
        fields = ('profile_photo','fullname','bio')