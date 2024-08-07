from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from src.Chartboard.app.parser import parseXmlLayout, getConfigNames, getFlipboardTitles
from src.Chartboard.app.properties import CarBOARD_CSS_STYLES, FLIPBOARD_INTERVAL, CarBOARD_JAVASCRIPT_FILES


def renderFlipboardHtml(request):
    """ Render the home page(Html flipboard), and start the javascript Chartboard mecanism """
    return render(request, 'flipboard.html',
                  dict(page_title='Carboard',
                       flipboard_interval=FLIPBOARD_INTERVAL,
                       Carboard_css=CarBOARD_CSS_STYLES,
                       Carboard_js=CarBOARD_JAVASCRIPT_FILES))


def renderDashboardHtmlUniqueDashboard(request, layout_name='default_config', isFlipboard=False):
    """
        Render Html page for all the tiles needed in layout_name(dashboard .yml)
        with CSS/JS dependency if isFlipboard is false
    """
    config = parseXmlLayout(layout_name)
    if config is not None:
        color_mode = "black"  # default color
        title = layout_name
        if 'details' in config:
            title = config['details']['page_title'] if 'page_title' in config['details'] else layout_name
            color_mode = config['details']['color_mode'] if 'color_mode' in config['details'] else color_mode
        if 'layout' in config:
            data = dict(layout=config['layout'],
                        layout_name=layout_name, page_title=title,
                        Carboard_css=list() if isFlipboard else CarBOARD_CSS_STYLES,
                        Carboard_js=list() if isFlipboard else CarBOARD_JAVASCRIPT_FILES,
                        color_mode=color_mode)
            return render(request, 'dashboard.html' if isFlipboard else 'flipboard.html', data)
    msg = f'''
    <br> <div style="color: red">
        No config file found for dashboard: {layout_name}
    Make sure that file: "{layout_name}" exists. </div> '''
    return HttpResponse(msg, status=404)


def renderDashboardHtmlForFlipboard(request, layout_name='default_config'):
    """ Render Html page with CSS/JS dependency for all the tiles needed in layout_name(dashboard .yml) """
    return renderDashboardHtmlUniqueDashboard(request, layout_name, isFlipboard=True)


def getDashboardsPaths(request):
    """
        Return the path of layout prensent in the ./Chartboard/app/Config
        Used in layout.js function(getDashboardsByApi) to flip between all dashboard(*.yml) in /Config
    """
    paths = ['/' + config_name for config_name in getConfigNames()]
    names = getFlipboardTitles()
    return JsonResponse(dict(paths=paths, names=names), safe=False)
