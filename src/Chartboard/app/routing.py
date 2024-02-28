from django.conf.urls import url
from src.Chartboard.app.views.wshandler import WSConsumer

websocket_urlpatterns = [
    url(r'^communication/websocket$', WSConsumer.as_asgi()),
]