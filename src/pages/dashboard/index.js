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
          const COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
          return {
            deviceId,
            coordinates: [`${COORXY.X}`, `${COORXY.Y}`]
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
      AMapLoader.load({
        key: "0f1c640e2f5e4cdca872febc63c7381c",                     // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",              // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.MoveAnimation'],               // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      }).then((AMap) => {
        const map = new AMap.Map("dashboardContainer", { //设置地图容器id
          // mapStyle: 'amap://styles/blue',
          viewMode: "2D",         //是否为3D地图模式
          zoom: 14,                //初始化地图级别
          center: [103.85784595108075, 30.04325952077016] //初始化地图中心点位置
        });
        
        var loca = new window.Loca.Container({
          map,
          opacity: 1,
        });
    
        let style = {
          radius: 8.5,
          unit: 'px',
          color: '#1890ff',
          borderWidth: 0,
          blurWidth: 3.5,
        }
    
        data.forEach(({coordinates}) => {
          geoJson.features.push(
            {
              "type": "Feature",
              "properties": {
                "consume": null
              },
              "geometry": {
                "type": "Point",
                "coordinates": coordinates
              }
            }
          )
        })
        const geo = new window.Loca.GeoJSONSource({
          data: geoJson
        })

        var pl = window.pl = new window.Loca.PointLayer({
          zIndex: 99999,
          blend: 'normal',
        });

       
        pl.setSource(geo);
        pl.setStyle(style);
        loca.add(pl);
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