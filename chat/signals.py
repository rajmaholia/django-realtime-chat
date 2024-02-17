# chat/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ChatUser

User = get_user_model()

@receiver(post_save, sender=User)
def create_chat_user(sender, instance, created, **kwargs):
    if created:
        ChatUser.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_chat_user(sender, instance, **kwargs):
    instance.chatuser.save()
