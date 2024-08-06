import time, random
from src.sensors.utils import end, sendUpdateByApi, updateChartJS


def sonde17(tester=None, tile_id='half_doughnut_ex'):
    start_time = time.time()
    data = updateChartJS(nbrDataset=random.randrange(1, 3), colorTabIndataset=True)
    CarboardAnswer = sendUpdateByApi(data=data, tileTemplate='half_doughnut_chart', tileId=tile_id, tester=tester)
    end(title=f'sensors17 -> {tile_id}', startTime=start_time, CarboardAnswer=CarboardAnswer, tileId=tile_id)
