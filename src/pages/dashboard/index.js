import './index.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Card } from 'antd'
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
function insert(str, index, string) {
  if (index > 0)
    return str.substring(0, index) + string + str.substring(index, str.length);
  else
    return string + str;
};

export default () => {
  const [data, setData] = useState([]);
  const geoJson = {
    "type": "FeatureCollection",
    "features": []
  }
  
  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch(`${window.urlApi}/device/getAllDeviceGpsOneData`)
      .then((response) => response.json())
      .then((json) => {
        if (!json?.data) {
          return
        }
        let lineArr = json?.data?.map(({ latitude, longitude, deviceId }) => {
          const long = Number(insert(longitude, 3, '.'))
          const lat = Number(insert(latitude, 2, '.'))
          let COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
          COORXY =  ChinaCoordTrans.gcj02tobd09(COORXY.X, COORXY.Y)
          return {
            deviceId, 
            coordinates: [COORXY.X, COORXY.Y]
          }
        })
        setData(lineArr)
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };

  useEffect(()=> {
    if(!!data.length) {
      const map = new window.BMapGL.Map("dashboardContainer");
      const point = new window.BMapGL.Point(103.85784595108075, 30.04325952077016);
      map.centerAndZoom(point, 14); 
      const scaleCtrl = new window.BMapGL.ScaleControl();  // 添加比例尺控件
      map.addControl(scaleCtrl);
      const zoomCtrl = new window.BMapGL.ZoomControl();  // 添加缩放控件
      map.addControl(zoomCtrl);

      // 创建小车图标
      // const myIcon = new window.BMapGL.Icon("http://124.221.189.38:8888/img/car.png", new window.BMapGL.Size(52, 26));
      data.forEach(({deviceId,coordinates})=> {
      // 创建定位点
      const markerPoint = new window.BMapGL.Point(coordinates[0],coordinates[1]);
      // 创建文本标注对象
      var labelopts = {
        position: markerPoint, // 指定文本标注所在的地理位置
        offset: new window.BMapGL.Size(0, 0) // 设置文本偏移量
      };
      const label = new window.BMapGL.Label(`id:${deviceId}`, labelopts);
      label.setStyle({
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "10px",
        padding: "0 8px",
        fontSize: "8px",
        lineHeight: "20px",
        border :"0",
          transform:'translateX(-50%)'
      });
      // 创建Marker标注，使用小车图标
      const marker = new window.BMapGL.Marker(markerPoint);
      // 将标注添加到地图
      map.addOverlay(marker);
      map.addOverlay(label);
      })

    }
  },[data])

  return <div className='dashboard-page'>
    <Card className='dashboard-page_info'>
      <h4>注册设备数量: {data?.length}</h4>
    </Card>
    {!!data?.length && <div id="dashboardContainer" className="map" style={{ height: '100%' }} />}
  </div>;
};