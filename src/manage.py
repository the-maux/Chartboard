import os
import sys
import subprocess
import time


def startRedisAgain(isTest):
    try:
        output = subprocess.check_output(['redis-cli', 'ping'])
        if 'PONG' in str(output):
            print('[LOG] Redis detected and running -> OK', flush=True)
            return True
        elif 'No such file or directory:' in str(output):
            print("[ERROR] can't execute redis")
        print(output)
    except FileNotFoundError:
        if isTest is True:
            return True
        print("[ERROR] Redis is not installed")
    return False


def redis_sanity_check(isTest):
    try:
        return startRedisAgain(isTest)
    except subprocess.CalledProcessError:
        print('[LOG] Trying to start Redis mannualy\n$>', flush=True)
        subprocess.check_output(['nohup', 'redis-server', '--protected-mode no'])
        time.sleep(3)
        if startRedisAgain(isTest):
            return True
    print('[ERROR] Redis didnt answered, is redis installed ?', flush=True)
    return False


def startDjango(settings_path='tipboard.webserver.settings', isTest=False):
    """ Start the django with DJANGO_SETTINGS_MODULE path added in env """
    if redis_sanity_check(isTest):
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_path)
        from django.core.management import execute_from_command_line
        return execute_from_command_line(sys.argv)
    else:
        return 1


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
    sys.path.insert(0, os.getcwd())  # Import project to PYTHONPATH
    if argv in ('sensors', '-s'):
        from src.sensors.sensors_main import scheduleYourSensors
        scheduleYourSensors()
    elif argv in ('test', 'runserver', 'migrate', 'shell', 'collectstatic', 'findstatic'):
        exit(startDjango(isTest='test' in argv))
    exit(show_help())
