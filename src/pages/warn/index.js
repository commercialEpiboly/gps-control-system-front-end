import './index.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { DotMap } from '@ant-design/maps';
import { Card, Table, Button } from 'antd'
import * as ChinaCoordTrans from 'chinacoordtrans'
import _ from 'lodash'
import {
  useNavigate,
} from "react-router-dom";

function insert(str, index, string) {
  if (index > 0)
    return str.substring(0, index) + string + str.substring(index, str.length);
  else
    return string + str;
};

export default () => {
  const [data, setData] = useState([]);
  const [qData, setQdata] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch(`${window.urlApi}/device/getAllDeviceGpsOneData`,{
      headers: {
        'Authorization': window.sessionStorage.getItem('token')
      }
    })
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
            coordinates: [COORXY.X, COORXY.Y]
          }
        })
        setData(lineArr)
      })
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };

  const config = {
    map: {
      type: 'mapbox',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: data[0]?.coordinates,
      zoom: 15,
      pitch: 0,
      token: 'pk.eyJ1IjoibGVubGVlIiwiYSI6ImNra3A5bjFyMTAwc20ydnF3dmJndWRubmwifQ.2hSdxy-hOFEBeK_hgsoKCQ'
    },
    source: {
      data: data,
      parser: { type: 'json', coordinates: 'coordinates' },
    },
    animate: true,
    state: {
      active: true,
    },
    size: 50,
    color: 'red',
    tooltip: {
      items: ['deviceId'],
    },
  };

  const [qeury, setQeury] = useState({
    engineNumber: "",
    frameNumber: "",
    idCard: "",
    numberPlate: "",
    pageNumber: 1,
    pageSize: 8,
    phoneNumber: ""
  })

  const qeuryHandle = () => {
    fetch(`${window.urlApi}/device/getDeviceInfo`, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(qeury),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.sessionStorage.getItem('token')
      },
    }).then((response) => response.json()).then(({ qData }) => {
      setQdata(qData)
    })
  }

  const onFinish = (filterData) => {
    Object.keys(filterData).map((key) => {
      filterData[key] = filterData[key] ? filterData[key] : ''
    })

    setQeury({
      ...qeury,
      ...filterData
    })
  }

  useEffect(() => {
    qeuryHandle()
  }, [])

  useEffect(() => {
    qeuryHandle()
  }, [qeury])


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
      width: 100,
      fixed: 'left',
    },
    {
      title: '设备识别码',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 100,
      fixed: 'left',
    },
    {
      title: '使用年限',
      dataIndex: 'usePeriod',
      key: 'usePeriod',
      width: 80,
    },
    {
      title: '身份证',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 150,
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
    },
    {
      title: '车架号',
      dataIndex: 'frameNumber',
      key: 'frameNumber',
      width: 150,
    },
    {
      title: '发动机号',
      dataIndex: 'engineNumber',
      key: 'engineNumber',
      width: 150,
    },
    {
      title: '编辑',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (text, item) => {
        return <>
          <Button type="link" onClick={() => jumpPage('/editInfo', item)}> 编辑 </Button>
          <Button type="link" onClick={() => jumpPage('/detailInfo', item)}> 轨迹 </Button>
        </>
      }
    },
  ];
  return <div className='warn-page'>
    <Card className='warn-page_info'>
      <h4>1小时内报警车辆: {data?.length}</h4>
    </Card>
    {!!data?.length && <DotMap {...config} />}
    <Card className='warn-page_list'>
      <Table scroll={{ x: 1500, y: 300 }} dataSource={[{
        "id": 1,
        "deviceId": "1440796010782",
        "idCard": "513821199401239038",
        "phoneNumber": "18181029381",
        "frameNumber": "16516565",
        "numberPlate": "451561",
        "engineNumber": "fsdfs",
        "brand": "雅迪",
        "color": "黑色",
        "dealerAddress": "成都市高新区",
        "status": "正常",
        "remark": "优秀备注",
        "createDateTime": "2022-03-17 18:06:08",
        "updateTime": "2022-03-24 22:17:10",
        "usePeriod": "20"
      }]} columns={columns} pagination={
        {
          current: qData?.number,
          total: qData?.totalElements,
          onChange: (NextPage) => {
            setQeury({ ...qeury, pageNumber: NextPage })
          }
        }
      } />
    </Card>
  </div>;
};