import os
import sys


def startDjango(settings_path='tipboard.webserver.settings'):
    """ Start the django with DJANGO_SETTINGS_MODULE path added in env """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_path)
    from django.core.management import execute_from_command_line
    try:
        return execute_from_command_line(sys.argv)
    except NotImplementedError:
        print('Django is not installed')


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
