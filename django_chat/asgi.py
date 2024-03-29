"""
ASGI config for django_chat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack  #NEW 
from channels.routing import ProtocolTypeRouter , URLRouter #NEW 
from django.core.asgi import get_asgi_application

import chat.routing #NEW

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_chat.settings')


#NEW 
application = ProtocolTypeRouter(
    {
        'http':get_asgi_application(),
        'websocket':AuthMiddlewareStack(
            URLRouter(
                chat.routing.websocket_urlpatterns
            )
        )
    }
)
