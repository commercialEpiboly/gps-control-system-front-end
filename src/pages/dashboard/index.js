import './index.css';
import React, { useState, useEffect } from 'react';
import { Card, message, Form, Table, Input, Button, Dropdown, Menu, Space } from 'antd'
import {
  useNavigate
} from "react-router-dom";
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
import {
  AppstoreOutlined
} from '@ant-design/icons';

function insert(str, index, string) {
  if (index > 0)
    return str.substring(0, index) + string + str.substring(index, str.length);
  else
    return string + str;
};

let map = null
let lineArr = null
export default () => {
  const { area } = JSON.parse(localStorage.getItem('userInfo'))
  const [qeury, setQeury] = useState({
    engineNumber: "",
    frameNumber: "",
    idCard: "",
    numberPlate: "",
    pageNumber: 1,
    pageSize: 8,
    phoneNumber: "",
    area
  })

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [dataTable, setDataTable] = useState({});


  useEffect(() => {
    asyncFetch();
  }, []);

  useEffect(() => {
    qeuryHandle()
  }, [qeury])

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
        lineArr = json?.data?.map(({ latitude, longitude, deviceId, brand, numberPlate, phoneNumber }) => {
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
      map = new window.BMapGL.Map("dashboardContainer");
      const point = new window.BMapGL.Point(103.85784595108075, 30.04325952077016);
      map.centerAndZoom(point, 14);
      map.enableScrollWheelZoom();
      const scaleCtrl = new window.BMapGL.ScaleControl();  // 添加比例尺控件
      map.addControl(scaleCtrl);
      const zoomCtrl = new window.BMapGL.ZoomControl();  // 添加缩放控件
      map.addControl(zoomCtrl);

      // 创建小车图标
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
          height: 180,
          title: `【${numberPlate}】${brand}`, // 信息窗口标题
          message: ""
        }

        const infoWindow = new window.BMapGL.InfoWindow('', opts);
        marker.addEventListener("click", () => {
          if (!phoneNumber) return

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
              `)
            })
          })
        });
      })

    }
  }, [data])

  const qeuryHandle = () => {
    fetch(`${window.urlApi}/device/getDeviceInfo`, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(qeury),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.sessionStorage.getItem('token')
      },
    }).then((response) => response?.json()).then(({ data }) => {
      setDataTable(data)
    }).catch(() => {
      setDataTable({})
    })
  }


  const onFinish = (filterData) => {
    Object.keys(filterData).map((key) => {
      filterData[key] = filterData[key] ? filterData[key] : ''
    })

    setQeury({
      ...qeury,
      ...filterData,
    })
  }
  const jumpPoint = (number) => {
    const car = _.find(lineArr, ({ numberPlate }) => {
      return number === numberPlate
    })
    if (car) {
      const markerPoint = new window.BMapGL.Point(car.coordinates[0], car.coordinates[1]);
      map.centerAndZoom(markerPoint, 19);
    }
  }


  const jumpPage = (url, data) => {
    if (data) {
      window.localStorage.setItem('data', '')
      window.localStorage.setItem('data', JSON.stringify(data))
    }
    navigate(url)
  }
  const columns = [
    {
      title: '车牌号',
      dataIndex: 'numberPlate',
      key: 'numberPlate',
      width: 90,
      fixed: 'left',
      render: (text, { numberPlate, brand }) => {
        return <>
          <span style={{ cursor: 'pointer' }} onClick={() => jumpPoint(numberPlate)}>{numberPlate} {brand}</span>
        </>
      }
    },
    {
      title: '菜单选项',
      dataIndex: 'brand',
      key: 'brand',
      width: 20,
      fixed: 'left',
      render: (text, item) => {
        return <>
          <Dropdown trigger={'click'} overlay={<Menu>
            <Menu.Item onClick={()=> jumpPage('/detailInfo', item)}>轨迹回放</Menu.Item>
            <Menu.Item onClick={()=> jumpPage('/realTimeLocation', item)}>实时位置</Menu.Item>
          </Menu>}>
            <Space>
              <Button>菜单</Button>
            </Space>
          </Dropdown>
        </>
      }
    },
  ];

  return <div className='dashboard-page'>
    <Card className='dashboard-page_info'>
      <h4>注册设备数量: {dataTable?.totalElements} | 上线设备数量: {data?.length}</h4>
    </Card>
    <Card className='dashboard-page_table'>
      <Form
        layout={'inline'}
        className='info-list_filter'
        onFinish={onFinish}
      >
        <Form.Item label="" name="numberPlate">
          <Input placeholder="搜索车牌号" allowClear />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">搜索</Button>
        </Form.Item>
      </Form>
      <Table dataSource={dataTable?.data} columns={columns} pagination={
        {
          showTotal: total => `总数 ${total} 条`,
          current: dataTable?.number,
          total: dataTable?.totalElements,
          onChange: (NextPage) => {
            setQeury({ ...qeury, pageNumber: NextPage })
          }
        }
      } />
    </Card>
    {!!data?.length && <div id="dashboardContainer" className="map" style={{ height: '100%' }} />}
  </div>;
};