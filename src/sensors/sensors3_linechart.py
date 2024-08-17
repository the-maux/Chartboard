import time
from src.sensors.utils import end, sendUpdateByApi, updateChartJS


def sonde3(tester=None, tile_id='line_chartjs_ex'):
    TILE_TEMPLATE = 'line_chart'
    start_time = time.time()
    data = updateChartJS(nbrLabel=50, nbrDataset=2)
    CarboardAnswer = sendUpdateByApi(data=data, tileTemplate=TILE_TEMPLATE, tileId=tile_id, tester=tester)
    end(title=f'sensors3 -> {tile_id}', startTime=start_time, CarboardAnswer=CarboardAnswer, tileId=tile_id)
