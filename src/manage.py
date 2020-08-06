import os
import sys
import subprocess
import time
from subprocess import DEVNULL


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
        if isTest is True:
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


def startDjango(settings_path='tipboard.webserver.settings'):
    """ Start the django with DJANGO_SETTINGS_MODULE path added in env """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_path)
    if redis_sanity_check(isTest='test' in sys.argv[1]):
        from django.core.management import execute_from_command_line
        try:
            return execute_from_command_line(sys.argv)
        except NotImplementedError:
            print('Django is not installed')
    return -1


def show_help():
    print('''
    Usage:
      -h, or help  \t\t=> show help usage
      -r, or runserver\t=> start the tipboard server
      -s, or sensors \t=> start sensors located in src/sensors ''', flush=True)
    return 0


def main_as_pkg():
    """ to become a python package and go to pypi, started in ../setup.py """
    return startDjango(settings_path='src.tipboard.webserver.settings')


if __name__ == '__main__':
    argv = sys.argv[1]
    sys.path.insert(0, os.getcwd())
    if argv in ('sensors', '-s'):
        from src.sensors.sensors_main import scheduleYourSensors
        scheduleYourSensors()
    elif argv in ('test', 'runserver', 'migrate', 'shell', 'collectstatic', 'findstatic'):
        sys.exit(startDjango())
    sys.exit(show_help())
