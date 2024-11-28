import sys
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from django.urls import re_path
from src.Chartboard.app.applicationconfig import redis_sanity_check
from src.Chartboard.app.views.api import push_api, project_info, tile_rest
from src.Chartboard.app.views.flipboard import getDashboardsPaths, renderFlipboardHtml
from src.Chartboard.app.views.flipboard import renderDashboardHtmlUniqueDashboard, renderDashboardHtmlForFlipboard

favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)

urlpatterns = [
    re_path(r'^flipboard/getDashboardsPaths$', getDashboardsPaths),  # get all dashboard in Config/

    re_path(r'^api/tiledata/([a-zA-Z0-9_-]+)$', tile_rest),  # get data of a single tile
    re_path(r'^api/push$', push_api),  # update data for a single tile
    re_path(r'^api/info$', project_info),  # get data from the Chartboard server

    re_path(r'^$', renderFlipboardHtml),  # start the flipboard logic for mulCarle dashboard in a single flipboard.html
    re_path(r'^([a-zA-Z0-9_-]*)$', renderDashboardHtmlUniqueDashboard),  # render a single dashboard.html
    re_path(r'^dashboard/([a-zA-Z0-9_-]*)$', renderDashboardHtmlForFlipboard),  # render the tiles html for ws in client js
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# Thanks for the Cars for execute only once a start :) https://stackoverflow.com/a/6792076/4797299
if not redis_sanity_check(isTest='test' in sys.argv[1]):
    sys.exit(-1)
