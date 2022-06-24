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
  const { area } = JSON.parse(localStorage.getItem('userInfo'))

  const [qeury, setQeury] = useState({
    engineNumber: "",
    frameNumber: "",
    idCard: "",
    numberPlate: "",
    status: '异常',
    pageNumber: 1,
    pageSize: 100,
    phoneNumber: "",
    area
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
    }).then((response) => response.json()).then(({ data }) => {
      debugger
      setQdata(data)
    })
  }

  useEffect(() => {
    qeuryHandle()
  }, [])


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
          <Button type="link" onClick={() => jumpPage('/detailInfo', item)}> 轨迹 </Button>
        </>
      }
    },
  ];
  return <div className='warn-page'>
    <Card className='warn-page_info'>
      <h4>异常车辆: {qData?.totalElements || 0}</h4>
    </Card>
    <Card className='warn-page_list'>
      <Table scroll={{ x: 1500, y: 300 }} dataSource={qData.data} columns={columns} pagination={
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