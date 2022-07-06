import React, { Component } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
import { Radio, Card, DatePicker, Button, message } from 'antd'
import './index.css';
import moment from 'moment'

const { RangePicker } = DatePicker;
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
      startTime: '',
      endTime: '',
      lastPoint: ''
    }

    this.map = {};
    this.marker = {};
    this.startAnimation = {};
    this.lushu = null;
  }


  initMap(lineArr, validData) {
    const defaultData = JSON.parse(window.localStorage.getItem('data'))
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
      defaultContent: " ",
      geodesic: false,
      autoCenter: true,
      landmarkPois: validData.map((v) => {
        const html = `
          <div class='lineCarInfo'>
            <div>品牌：${defaultData.brand} | 车牌号：${defaultData.numberPlate} | 颜色：${defaultData.color}</div>
            <div>速度：${v.speed / 10}(Km/h)</div>
            <div>时间：${v.createDateTime}</div>
          </div>`
        return { lng: v.longitude, lat: v.latitude, html, }
      }),
      icon: new window.BMapGL.Icon('https://www.jusenkaiyue.cn/img/car.png', new window.BMapGL.Size(30, 30), { anchor: new window.BMapGL.Size(15, 30) }),
      speed: 1,
      enableRotation: false
    });
  }

  getGPS() {
    const defaultData = JSON.parse(window.localStorage.getItem('data'))
    const startTime = this.state.startTime
    const endTime = this.state.endTime
    let deviceId = defaultData?.deviceId?.length === 11 ? defaultData?.deviceId : defaultData?.deviceId?.substring(2)
    fetch(`${window.urlApi}/device/getDeviceGpsList?deviceId=${deviceId}&startTime=${startTime}&endTime=${endTime}`, {
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
      lineArr = _.uniqWith(data, (a, b) => {
        return _.isEqual({
          latitude: a.latitude,
          longitude: a.longitude
        }, {
          latitude: b.latitude,
          longitude: b.longitude
        })
      }).reverse()

      lineArr.splice(lineArr.length - 2)

      lineArr = lineArr.map((v) => {
        const { id, latitude, longitude } = v
        const long = Number(insert(longitude, 3, '.'))
        const lat = Number(insert(latitude, 2, '.'))
        let COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
        COORXY = ChinaCoordTrans.gcj02tobd09(COORXY.X, COORXY.Y)
        validData.unshift({
          ...v,
          longitude: COORXY.X,
          latitude: COORXY.Y
        })
        return [COORXY.X, COORXY.Y]
      })

      if (!lineArr.length) {
        message.warn('此时间段没有轨迹数据，请选择3天内的时间');
        return
      }

      this.setState({
        lastPoint: lineArr[0]
      })

      this.initMap(lineArr, validData.reverse())
    })
  }

  // 2.dom渲染成功后进行map对象的创建
  componentDidMount() {
    this.getGPS()
  }

  changeRange(data) {
    if (data) {
      const startTime = moment(data[0]).format('yyyy-MM-DD HH:mm:ss')
      const endTime = moment(data[1]).format('yyyy-MM-DD HH:mm:ss')
      this.setState({
        startTime,
        endTime
      })
    } else {
      this.setState({
        startTime: '',
        endTime: ''
      })
    }
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
                    this.lushu.hideInfoWindow()
                    this.lushu.start()
                  }}>重新播放</Radio.Button> :
                  <Radio.Button onClick={() => {
                    this.setState({
                      startAnimation: true
                    })
                    this.lushu.start((info) => {
                      
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
            <RangePicker allowClear showTime onChange={this.changeRange.bind(this)} />
            <Button onClick={this.getGPS.bind(this)}>获取轨迹</Button>
            {
              this.state?.lastPoint && <a href={`http://api.map.baidu.com/geocoder?location=${this.state?.lastPoint[1]},${this.state?.lastPoint[0]}&coord_type=gcj02&output=html&src=webapp.baidu.openAPIdemo`}>开始导航</a>
            }
          </Card>
        </div>
      </div>
    );
  }
}
//导出地图组建类
export default MapComponent;