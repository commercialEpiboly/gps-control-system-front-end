import React, { Component } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
import { Radio, Card } from 'antd'
import './index.css';
/**
 * 
 * props center
*/
const { Meta } = Card;

function insert(str, index, string) {
  if (index > 0)
    return str.substring(0, index) + string + str.substring(index, str.length);
  else
    return string + str;
};

let MapContainer = null;
let MapContainerPath = null;

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startAnimation: false,
      pause: false,
    }
    this.map = {};
    this.marker = {};
    this.startAnimation = {};
    this.lushu = null;
  }
  // 2.dom渲染成功后进行map对象的创建
  componentDidMount() {
    const initMap = (lineArr) => {
      const point = new window.BMapGL.Point(lineArr[0][0], lineArr[0][1]);
      MapContainer.centerAndZoom(point, 15);
      MapContainer.enableScrollWheelZoom();

      const path = lineArr.map((point) => {
        return new window.BMapGL.Point(point[0], point[1])
      })

      MapContainerPath = new window.BMapGL.Polyline(path, {
        strokeWeight: 5,
        strokeColor: '#0c6',
        strokeOpacity: 0.8
      });

      MapContainer.addOverlay(MapContainerPath);

      this.lushu = new window.BMapGLLib.LuShu(MapContainer, MapContainerPath.getPath(), {
        geodesic: false,
        autoCenter: true,
        icon: new window.BMapGL.Icon('https://www.jusenkaiyue.cn/img/car.png', new window.BMapGL.Size(30, 30), { anchor: new window.BMapGL.Size(15, 30) }),
        speed: 300,
        enableRotation: false
      });
      this.lushu.showInfoWindow()
    }

    const defaultData = JSON.parse(window.localStorage.getItem('data'))

    let deviceId = defaultData?.deviceId?.length === 11 ? defaultData?.deviceId : defaultData?.deviceId?.substring(2)
    fetch(`${window.urlApi}/device/getDeviceGpsList?deviceId=${deviceId}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Authorization': window.sessionStorage.getItem('token')
      }
    }).then((response) => response.json()).then(({ data }) => {
      MapContainer = new window.BMapGL.Map("container");
      const validData = []
      let lineArr = [];
      // 去重
      // debugger
      lineArr = _.uniqWith(data, (a, b) => {
        return _.isEqual({
          latitude: a.latitude,
          longitude: a.longitude
        }, {
          latitude: b.latitude,
          longitude: b.longitude
        })
      }).reverse()

      lineArr = lineArr.map((v) => {
        const { id, latitude, longitude } = v
        validData.unshift(v)
        const long = Number(insert(longitude, 3, '.'))
        const lat = Number(insert(latitude, 2, '.'))
        let COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);

        COORXY = ChinaCoordTrans.gcj02tobd09(COORXY.X, COORXY.Y)
        return [COORXY.X, COORXY.Y]
      })
      console.log(lineArr[0])
      initMap(lineArr, validData)
    })
  }


  render() {
    return (
      <div className='mapContainer'>
        <div id="container" className="map" style={{ height: '650px' }} >
        </div>
        <div className="input-card">
          <Card>
            <h4>轨迹回放控制</h4>
            <Radio.Group>
              {
                this.state.startAnimation ?
                  <Radio.Button onClick={() => {
                    this.lushu.start()
                  }}>重新播放</Radio.Button> :
                  <Radio.Button onClick={() => {
                    this.setState({
                      startAnimation: true
                    })
                    this.lushu.start((info)=> {
                      console.log()
                    })
                  }}>开始播放</Radio.Button>
              }
              {
                this.state.pause ?
                  <Radio.Button onClick={
                    () => {
                      this.setState({
                        pause: false
                      })
                      this.lushu.start()
                    }}>继续播放</Radio.Button> :
                  <Radio.Button onClick={() => {
                    this.setState({
                      pause: true
                    })
                    this.lushu.pause()
                  }}>暂停播放</Radio.Button>
              }

            </Radio.Group>
          </Card>
        </div>
      </div>
    );
  }
}
//导出地图组建类
export default MapComponent;