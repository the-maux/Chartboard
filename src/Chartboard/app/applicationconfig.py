import subprocess
from subprocess import DEVNULL
import time, datetime
from django.apps import AppConfig


class CarboardConfig(AppConfig):
    name = 'Chartboard'
    verbose_name = 'DjangoBoard'


def getIsoTime():
    localtime = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
    tz = '{0:+06.2f}'.format(-float(time.altzone) / 3600)
    iso_time = localtime + tz.replace('.', ':')  # ISO-8601
    return iso_time


def getRedisPrefix(tile_id='*'):
    return f'tile:{tile_id}'


def startRedisAgain(isTest):
    try:
        output = subprocess.check_output(['redis-cli', 'ping'])  # Cant put full path for Windows compatibility
        if 'PONG' in str(output):
            print('[LOG] Redis detected and running -> OK', flush=True)
            return True
        if 'No such file or directory:' in str(output):
            print("[ERROR] can't execute redis: No such file or directory")
        print(output)
    except FileNotFoundError:
        if isTest:
            return True
        print("[ERROR] Redis is not installed or wasn't found on the system")
    return False


def redis_sanity_check(isTest):
    try:
        return startRedisAgain(isTest)
    except subprocess.CalledProcessError:
        print('[LOG] CalledProcessError but will try to start Redis mannualy', flush=True)
        subprocess.Popen(['nohup', 'redis-server', '--protected-mode no'], stdout=DEVNULL)
        time.sleep(3)
        if startRedisAgain(isTest):
            return True
    print('[ERROR] Redis didnt answered, is redis installed ?', flush=True)
    return False
