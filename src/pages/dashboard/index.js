import './index.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Card, message } from 'antd'
import {
  useNavigate
} from "react-router-dom";
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
function insert(str, index, string) {
  if (index > 0)
    return str.substring(0, index) + string + str.substring(index, str.length);
  else
    return string + str;
};

export default () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const geoJson = {
    "type": "FeatureCollection",
    "features": []
  }

  useEffect(() => {
    asyncFetch();
  }, []);

  const { area } = JSON.parse(localStorage.getItem('user'))

  const asyncFetch = () => {
    fetch(`${window.urlApi}/device/getAllDeviceGpsOneData?area=${area}`, {
      headers: {
        'Authorization': window.sessionStorage.getItem('token')
      }
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json?.data) {
          return
        }
        let lineArr = json?.data?.map(({ latitude, longitude, deviceId, brand, numberPlate, phoneNumber }) => {
          const long = Number(insert(longitude, 3, '.'))
          const lat = Number(insert(latitude, 2, '.'))
          let COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
          COORXY = ChinaCoordTrans.gcj02tobd09(COORXY.X, COORXY.Y)
          return {
            deviceId,
            coordinates: [COORXY.X, COORXY.Y],
            brand,
            numberPlate,
            phoneNumber
          }
        })
        setData(lineArr)
      })
      .catch((error) => {
        if (!window.sessionStorage.getItem('token')) {
          message.error('没有登陆或登录超时');
          navigate('/login')
        }
      });
  };
  const geoc = new window.BMapGL.Geocoder();
  useEffect(() => {
    if (!!data.length) {
      window.scrollTo(0, 0)
      const map = new window.BMapGL.Map("dashboardContainer");
      const point = new window.BMapGL.Point(103.85784595108075, 30.04325952077016);
      map.centerAndZoom(point, 14);
      map.enableScrollWheelZoom();
      const scaleCtrl = new window.BMapGL.ScaleControl();  // 添加比例尺控件
      map.addControl(scaleCtrl);
      const zoomCtrl = new window.BMapGL.ZoomControl();  // 添加缩放控件
      map.addControl(zoomCtrl);

      // 创建小车图标
      // const myIcon = new window.BMapGL.Icon("http://124.221.189.38:8888/img/car.png", new window.BMapGL.Size(52, 26));
      data.forEach(({ deviceId, coordinates, brand, numberPlate, phoneNumber }) => {
        // 创建定位点
        const markerPoint = new window.BMapGL.Point(coordinates[0], coordinates[1]);
        // 创建文本标注对象
        var labelopts = {
          position: markerPoint, // 指定文本标注所在的地理位置
          offset: new window.BMapGL.Size(0, 0) // 设置文本偏移量
        };
        const label = new window.BMapGL.Label(numberPlate ? `【${numberPlate}】${brand}` : `设备ID${deviceId}`, labelopts);
        label.setStyle({
          color: "#fff",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
          padding: "0 8px",
          fontSize: "14px",
          letterSpacing: '-1px',
          lineHeight: "20px",
          border: "0",
          transform: 'translate(-50%, -170%)',
        });
        // 创建小车图标
        const myIcon = new window.BMapGL.Icon("https://www.jusenkaiyue.cn/img/car.png", new window.BMapGL.Size(30, 30));
        const marker = new window.BMapGL.Marker(markerPoint, {
          icon: myIcon
        });
        // 将标注添加到地图
        map.addOverlay(marker);
        map.addOverlay(label);

        const opts = {
          width: 300,
          height: 200,
          title: `【${numberPlate}】${brand}`, // 信息窗口标题
          message: "这里是故宫"
        }

        const infoWindow = new window.BMapGL.InfoWindow('', opts);
        marker.addEventListener("click", function () {
          if(!phoneNumber) return 
          
          map.openInfoWindow(infoWindow, markerPoint); //开启信息窗口
          map.centerAndZoom(markerPoint, 19);

          fetch(`${window.urlApi}/device/getDeviceInfo`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
              engineNumber: "",
              z: "",
              idCard: "",
              numberPlate: "",
              pageNumber: 1,
              pageSize: 1,
              phoneNumber,
              area,
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': window.sessionStorage.getItem('token')
            },
          }).then((response) => response.json()).then(({ data }) => {
            const { frameNumber, engineNumber, color, idCard, dealerAddress, status, usePeriod, createDateTime } = data?.data[0]

            infoWindow.addEventListener("clickclose", () => {
              map.centerAndZoom(markerPoint, 14);
            })

            geoc.getLocation(markerPoint, (rs) => {

              infoWindow.setContent(`
              <p>颜色：${color} 发动机/电机号：${engineNumber} 车架号：${frameNumber}</p>
              <p>身份证：${idCard}</p>
              <p>经销商地址：${dealerAddress}</p>
              <p>状态：${status} 使用年限：${usePeriod}/年</p>
              <p>创建时间：${createDateTime}</p>
              <div class='dashboardInfoLine'></div>
              <p>${rs.address}${rs?.surroundingPois[0]?.title || ''}</p>
              <div class='dashboardInfoLine'></div>
              <div class='buttons'>
                <span class="button" data-id="">轨迹回放</span>
                <span class="button" data-id="">实时定位</span>
              </div>
              `)
            })
          })
        });
      })

    }
  }, [data])

  return <div className='dashboard-page'>
    <Card className='dashboard-page_info'>
      <h4>注册设备数量: {data?.length}</h4>
    </Card>
    {!!data?.length && <div id="dashboardContainer" className="map" style={{ height: '100%' }} />}
  </div>;
};