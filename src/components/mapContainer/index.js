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
  }
  // 2.dom渲染成功后进行map对象的创建
  componentDidMount() {
    AMapLoader.load({
      key: "0f1c640e2f5e4cdca872febc63c7381c",                     // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0",              // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.MoveAnimation'],               // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    }).then((AMap) => {
      this.AMap = AMap
      this.map = new AMap.Map("container", { //设置地图容器id
        viewMode: "2D",         //是否为3D地图模式
        zoom: 10,                //初始化地图级别
        center: [103.85784595108075, 30.04325952077016] //初始化地图中心点位置
      });
      // JSAPI2.0 使用覆盖物动画必须先加载动画插件
      AMap.plugin('AMap.MoveAnimation', () => {
        var lineArrData, lineArr = [];
        const defaultData = JSON.parse(window.localStorage.getItem('data'))

        let deviceId = defaultData?.deviceId?.length === 11 ? defaultData?.deviceId : defaultData?.deviceId?.substring(2)
        fetch(`${window.urlApi}/device/getDeviceGpsList?deviceId=${deviceId}`, {
          method: 'GET',
          mode: 'cors',
        }).then((response) => response.json()).then(({ data }) => {
          const validData = []
          // 去重
          // debugger
          lineArr = _.uniqWith(data, (a,b)=> {
            return _.isEqual({
              latitude: a.latitude,
              longitude: a.longitude
            },{
              latitude: b.latitude,
              longitude: b.longitude
            })
          }).reverse()
        
          lineArr = lineArr.map((v) => {
            const { id, latitude, longitude } = v 
            validData.unshift(v)
            const long = Number(insert(longitude, 3, '.'))
            const lat = Number(insert(latitude, 2, '.'))
            const COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
            return [COORXY.X, COORXY.Y]
          })

          // 处理第一上线时候的初始化坐标
          lineArr.pop()
          lineArr.pop()

          var map = new AMap.Map("container", {
            resizeEnable: true,
            center: [103.85784595108075, 30.04325952077016],
            zoom: 10
          });

          this.marker = new AMap.Marker({
            map: map,
            position: lineArr[0],
            icon: new AMap.Icon({            
              image: "https://www.jusenkaiyue.cn/img/car.png",
              size: new AMap.Size(30, 30),  //图标大小
              imageSize: new AMap.Size(30,30)
            }),
            offset: new AMap.Pixel(-15, -30),
            extData: validData.reverse(),
          });

          // 绘制轨迹
          var polyline = new AMap.Polyline({
            map: map,
            path: lineArr,
            showDir: true,
            strokeColor: "#28F",  //线颜色
            strokeWeight: 6,      //线宽
          });

          var passedPolyline = new AMap.Polyline({
            map: map,
            strokeColor: "#AF5",  //线颜色
            strokeWeight: 6,      //线宽
          });

          this.marker.on('moving', (e) => {
            const {speed, updateTime} = e.target.getExtData()[e.index]

            const labelContent = `<div class="carbox">
              <p>当前速度: ${speed / 10} km/H</p>
              <p>当前时间: ${updateTime}</p>
            </div>`;
            const label = {
              offset: new AMap.Pixel(-90, 40),
              content: labelContent
            };
            
            
            this.marker.setLabel(label)
            passedPolyline.setPath(e.passedPath);
            map.setCenter(e.target.getPosition(), true)
          });

          map.setFitView();

          this.startAnimation = () => {
            this.marker.moveAlong(lineArr, {
              // 每一段的时长
              duration: 100,//可根据实际采集时间间隔设置
              // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
              autoRotation: false,
            });
          };
        })
      });

    }).catch(e => {
      console.log(e);
    })
  }

  render() {
    return (
      <div className='mapContainer'>
        <div id="container" className="map" style={{ height: '550px' }} >
        </div>
        <div className="input-card">
          <Card>
            <h4>轨迹回放控制</h4>
            <Radio.Group>
              {
                this.state.startAnimation ? 
                <Radio.Button onClick={() => { 
                  this.startAnimation()
                }}>重新播放</Radio.Button> :
                <Radio.Button onClick={() => {
                  this.setState({
                    startAnimation: true
                  })
                   this.startAnimation() 
                }}>开始播放</Radio.Button>
              }
              {
                this.state.pause ? 
                <Radio.Button onClick={
                  () => { 
                    this.setState({
                      pause: false
                    })
                    this.marker.resumeMove()
                  }}>继续播放</Radio.Button>  : 
                  <Radio.Button onClick={() => { 
                    this.setState({
                      pause: true
                    })
                    this.marker.pauseMove() 
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