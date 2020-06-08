from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from src.tipboard.app.applicationconfig import getRedisPrefix
from src.tipboard.app.properties import BASIC_CONFIG, REDIS_DB, DEBUG, ALLOWED_TILES, API_KEY
from src.tipboard.app.cache import MyCache, save_tile
from src.tipboard.app.parser import getConfigNames


def project_info(request):
    """ Return infos about tipboard server """
    cache = MyCache()
    return JsonResponse(dict(is_redis_connected=cache.isRedisConnected,
                             last_update=cache.getLastUpdateTime(),
                             first_start=cache.getFirstTimeStarter(),
                             project_default_config=BASIC_CONFIG,
                             dashboard_list=getConfigNames(),
                             redis_db=REDIS_DB))


def get_tile(request, tile_key):
    httpMessage = ''
    httpStatus_code = 200
    redis = MyCache().redis
    if redis.exists(getRedisPrefix(tile_key)):
        if request.method == 'DELETE':
            redis.delete(tile_key)
            httpMessage = 'Tile\'s data deleted.'
        if request.method == 'GET':
            httpMessage = redis.get(tile_key)
    else:
        httpMessage = f'{tile_key} key does not exist.'
        httpStatus_code = 400
    return httpMessage, httpStatus_code


def tile_rest(request, tile_key):
    """ Handles reading and deleting of tile's data """
    if request.GET.get('API_KEY', 'NO_API_KEY_FOUND') == API_KEY or DEBUG:
        http_message, status_code = get_tile(request, tile_key)
    else:
        http_message = 'API KEY incorrect'
        status_code = 401
    return HttpResponse(http_message, status=status_code)


def sanity_push_api(request):
    """ Test token, all data present, correct tile_template and tile_id present in cache """
    if request.GET.get('API_KEY', 'NO_API_KEY_FOUND') != API_KEY and DEBUG is False:
        return False, HttpResponse('API KEY incorrect', status=401)
    HttpData = request.POST
    if not HttpData.get('tile_id', None) or not HttpData.get('tile_template', None) or \
            not HttpData.get('data', None):
        return False, HttpResponseBadRequest('Missing data')
    if HttpData.get('tile_template', None) not in ALLOWED_TILES:
        tile_template = HttpData.get('tile_template', None)
        return False, HttpResponseBadRequest(f'tile_template: {tile_template} is unknow')
    cache = MyCache()
    tilePrefix = getRedisPrefix(HttpData.get('tile_id', None))
    if not cache.redis.exists(tilePrefix) and not DEBUG:
        return False, HttpResponseBadRequest(f'tile_id: {tilePrefix} is unknow')
    return True, HttpData


def push_api(request):
    """ Update the content of a tile (widget) """
    if request.method == 'POST':
        state, HttpData = sanity_push_api(request)
        if state:
            tile_id = HttpData.get('tile_id', None)
            tile_template = HttpData.get('tile_template', None)
            tile_data = HttpData.get('data', None)
            tile_meta = HttpData.get('meta', None)
            if save_tile(tile_id=tile_id, template=tile_template, data=tile_data, meta=tile_meta):
                return HttpResponse(f'{tile_id} data updated successfully.')
            HttpData = HttpResponse(f'Error while saving tile with tile_id: {tile_id}')
        return HttpData
    return HttpResponseBadRequest('Only post http request allowed')
