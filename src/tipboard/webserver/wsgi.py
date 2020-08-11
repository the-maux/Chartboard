import os
import signal
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webserver.settings')

application = get_wsgi_application()


def detectIfRedisNeedToDie():
    import subprocess
    print('Killing redis server')
    subprocess = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
    output, error = subprocess.communicate()
    target_process = 'redis-server'
    for line in output.splitlines():
        if target_process in str(line):
            pid = int(line.split(None, 1)[0])
            os.kill(pid, 9)


signal.signal(signal.SIGINT, detectIfRedisNeedToDie)
