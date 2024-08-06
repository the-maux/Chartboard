import time, random
from src.sensors.utils import end, sendUpdateByApi, updateChartJS


def sonde16(tester=None, tile_id='doughnut_ex'):
    start_time = time.time()
    data = updateChartJS(nbrDataset=random.randrange(1, 3), colorTabIndataset=True)
    CarboardAnswer = sendUpdateByApi(data=data, tileTemplate='doughnut_chart', tileId=tile_id, tester=tester)
    end(title=f'sensors3 -> {tile_id}', startTime=start_time, CarboardAnswer=CarboardAnswer, tileId=tile_id)
