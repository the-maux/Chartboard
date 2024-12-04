from django.urls import re_path
from src.Chartboard.app.views.wshandler import WSConsumer

websocket_urlpatterns = [
    re_path(r'^communication/websocket$', WSConsumer.as_asgi()),
]
