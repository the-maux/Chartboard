import time
from src.sensors.utils import end, sendUpdateByApi, updateChartJS


def sonde12(tester=None, tile_id='normjs_ex'):
    start_time = time.time()
    data = updateChartJS(colorTabIndataset=False)
    CHARTBOARDAnswer = sendUpdateByApi(tileTemplate='norm_chart', tileId=tile_id, data=data, tester=tester)
    end(title=f'sensors12 -> {tile_id}', startTime=start_time, CHARTBOARDAnswer=CHARTBOARDAnswer, tileId=tile_id)
