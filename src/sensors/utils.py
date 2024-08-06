import datetime, json, requests, time, random
from src.Chartboard.app.properties import CarBOARD_URL, COLOR_TAB, LOG


def end(title=None, startTime=None, CarboardAnswer=None, tileId=None):
    """ Eazy way to end sensors, print the action time & http answer of Chartboard """
    if LOG:
        if CarboardAnswer.status_code != 200:
            print(f'[ERROR] POST tile:{tileId} Chartboard/push => ({CarboardAnswer.status_code}): ', flush=True)
        else:
            duration = time.time() - startTime
            m = str(duration / 60)[:str(duration / 60).index('.')]
            s = str(duration % 60)[:str(duration % 60).index('.')]


def getTimeStr():
    """ Eazy way to get in str, time for log """
    return datetime.datetime.now().strftime('%Hh%M')


def sendUpdateByApi(tileId=None, data=None, tileTemplate=None, tester=False, meta=None):
    """ Send data to url django /push, if it's a test, send the django.UnitTest fake client """
    configTile = dict(tile_id=tileId, tile_template=tileTemplate, data=json.dumps(data))
    if meta is not None:
        configTile['meta'] = json.dumps(meta)
    if tester is None:
        return requests.post(CarBOARD_URL + '/push', data=configTile)
    return tester.fakeClient.post(CarBOARD_URL + '/push', data=configTile)


def buildDataset(index, nbrLabel, data, colorTabIndataset):
    return dict(label=f'Serie {index + 1}',
                data=[random.randrange(100, 1000) for _ in range(nbrLabel)] if data is None else data,
                backgroundColor=COLOR_TAB[index] if colorTabIndataset is False else COLOR_TAB,
                borderColor=COLOR_TAB[index] if colorTabIndataset is False else '#626262')


def buildChartJsTitle(nbrDataset, nbrLabel):
    return dict(text=f'{nbrDataset} dataset & {nbrLabel} labels',
                color='#FFFFFF',
                display=random.choice([True, True]),
                position=random.choice(['top', 'bottom', 'right', 'left']))


def updateChartJS(nbrDataset=None, nbrLabel=None, colorTabIndataset=False, data=None):
    """
        Build a full dataset, title, legend for title with random data
        For the demo, it show the possibility to hide title/legend/label, randomly
    """
    nbrDataset = random.randrange(1, 5) if nbrDataset is None else nbrDataset
    nbrLabel = random.randrange(2, 13) if nbrLabel is None else nbrLabel
    tileData = dict(title=buildChartJsTitle(nbrDataset, nbrLabel),
                    legend=dict(display=False if nbrDataset > 6 else random.choice([True, False])),
                    labels=[f'{i}' for i in range(nbrLabel)],
                    datasets=list())
    for index in range(nbrDataset):
        tileData['datasets'].append(buildDataset(index, nbrLabel, data, colorTabIndataset))
    return tileData
