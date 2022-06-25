import React, { Component } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import * as ChinaCoordTrans from 'chinacoordtrans'
import _, { set } from 'lodash'
import { Radio, Card, DatePicker, Descriptions, message } from 'antd'
import './index.css';


function insert(str, index, string) {
    if (index > 0)
        return str.substring(0, index) + string + str.substring(index, str.length);
    else
        return string + str;
};

let MapContainer = null;
let MapContainerPath = null;

export default class MapComponent extends Component {
    constructor(props) {
        super(props);
        this.defaultData = JSON.parse(window.localStorage.getItem('data'))

        this.interval = null;
        this.list = [
            {
              label: '设备识别码',
              name: 'deviceId',
            },
            {
              label: '创建时间',
              name: 'createDateTime'
            },
            {
              label: '使用年限',
              name: 'usePeriod'
            },
            {
              label: '身份证',
              name: 'idCard',
            },
            {
              label: '手机号',
              name: 'phoneNumber',
            },
            {
              label: '车架号',
              name: 'frameNumber',
            },
            {
              label: '车牌号',
              name: 'numberPlate',
            },
            {
              label: '发动机号',
              name: 'engineNumber',
            }, {
              label: '牌子',
              name: 'brand',
            }, {
              label: '颜色',
              name: 'color',
            }, {
              label: '经销商地址',
              name: 'dealerAddress',
            }, {
              label: '状态',
              name: 'status',
            }, {
              label: '备注',
              name: 'remark',
            },
          ]
    }

    componentWillUnmount() {
        clearInterval(this.interval)
        console.log('8-组件销毁')
    }



    initMap(lineArr, validData) {
        const point = new window.BMapGL.Point(lineArr[0][0], lineArr[0][1]);
        MapContainer.centerAndZoom(point, 18);
        MapContainer.enableScrollWheelZoom();

        // 创建小车图标
        const myIcon = new window.BMapGL.Icon("https://www.jusenkaiyue.cn/img/car.png", new window.BMapGL.Size(30, 30));
        const marker = new window.BMapGL.Marker(point, {
            icon: myIcon
        });
        // 将标注添加到地图
        MapContainer.addOverlay(marker);

        const defaultData = JSON.parse(window.localStorage.getItem('data'))
        let deviceId = defaultData?.deviceId?.length === 11 ? defaultData?.deviceId : defaultData?.deviceId?.substring(2)

        this.interval = setInterval(() => {
            fetch(`${window.urlApi}/device/getDeviceGpsList?deviceId=${deviceId}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Authorization': window.sessionStorage.getItem('token')
                }
            }).then((response) => response.json()).then(({ data }) => {
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

                lineArr = lineArr.map((v) => {
                    const { id, latitude, longitude } = v
                    const long = Number(insert(longitude, 3, '.'))
                    const lat = Number(insert(latitude, 2, '.'))
                    let COORXY = ChinaCoordTrans.wgs84togcj02(long, lat);
                    COORXY = ChinaCoordTrans.gcj02tobd09(COORXY.X, COORXY.Y)
                    return [COORXY.X, COORXY.Y]
                })

                const currentPoint = new window.BMapGL.Point(lineArr[0][0], lineArr[0][1]);
                marker.setPosition(currentPoint)
            })
        }, 50000);
    }

    getGPS() {
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

            this.initMap(lineArr, validData.reverse())
        })
    }

    // 2.dom渲染成功后进行map对象的创建
    componentDidMount() {
        this.getGPS()
    }


    render() {
        return (<div className='realTimeLocationmapContainer'>
            <Descriptions title="实时监控【5分钟更新一次位置】">
                {
                    this.list.map(({ label, name }, index) => {
                        return <Descriptions.Item key={index} label={label}> {this.defaultData[name]} </Descriptions.Item>
                    })
                }
            </Descriptions>
            <div id="container" className="map" style={{ height: '650px' }} >
            </div>
        </div>)
    }
}