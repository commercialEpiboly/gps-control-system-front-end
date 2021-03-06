import React, { useState, useEffect} from 'react';
import './index.css';
import {
  useNavigate,
} from "react-router-dom";
import { Table, Form, Input, Button, Radio ,InputNumber} from 'antd';
// 创建时间 *
// 使用年限 
// 身份证 搜索
// 手机号 搜索
// 车架号 搜索
// 车牌号 搜索
// 发动机号 搜索
// 牌子
// 颜色
// 经销商地址
// 状态  离线/上线 *
// 备注 *
export default () => {
  const navigate = useNavigate();
  const [qeury, setQeury] = useState({
    engineNumber: "",
    frameNumber: "",
    idCard: "",
    numberPlate: "",
    pageNumber: 1,
    pageSize: 8,
    phoneNumber: ""
  })
  const [data, setData] = useState({})

  const qeuryHandle = () =>{
    fetch(`${window.urlApi}/device/getDeviceInfo`, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(qeury),
      headers: {
        'Content-Type': 'application/json'
      },
    }).then((response)=> response.json()).then(({data})=> {
      setData(data)
    })
  }

  const onFinish = (filterData) => {
    Object.keys(filterData).map((key)=> {
      filterData[key] = filterData[key] ? filterData[key] : '' 
    })

    setQeury({
      ...qeury,
      ...filterData
    })
  }

  useEffect(()=> {
    qeuryHandle() 
  },[])

  useEffect(()=> {
    qeuryHandle()
  },[qeury])


  const jumpPage = (url, data) => {
    if(data) {
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
    },
    {
      title: '使用年限',
      dataIndex: 'usePeriod',
      key: 'usePeriod',
      width: 150,
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
      title: '品牌名称',
      dataIndex: 'brand',
      key: 'brand',
      width: 150,
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createDateTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '最新修改时间',
      dataIndex: 'updateTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '编辑',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      fixed: 'right',
      render: (text, item) => {
        return <>
          <Button type="link" onClick={() => jumpPage('/editInfo',item)}> 编辑 </Button>
          <Button type="link" onClick={() => jumpPage('/detailInfo',item)}> 轨迹 </Button>
        </>
      }
    },
  ];
  // 身份证 搜索
  // 手机号 搜索
  // 车架号 搜索
  // 车牌号 搜索
  // 发动机号 搜索
  return (
    <div className="info-list">
      <Form
        layout={'inline'}
        className='info-list_filter'
        onFinish={onFinish}
      >
        <Form.Item label="身份证" name="idCard">
          <Input placeholder="身份证" allowClear/>
        </Form.Item>
        <Form.Item label="手机号" name="phoneNumber">
          <InputNumber placeholder="手机号" allowClear/>
        </Form.Item>
        <Form.Item label="车架号" name="frameNumber">
          <Input placeholder="车架号" allowClear/>
        </Form.Item>
        <Form.Item label="发动机号" name="engineNumber">
          <Input placeholder="发动机号" allowClear/>
        </Form.Item>
        <Form.Item label="车牌号" name="numberPlate">
          <Input placeholder="车牌号" allowClear/>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">搜索</Button>
        </Form.Item>
      </Form>
      <Table scroll={{ x: 1500, y: 400 }} dataSource={data?.data} columns={columns} pagination={
        {
          current: data?.number,
          total: data?.totalElements,
          onChange: (NextPage)=> {
            setQeury({...qeury,pageNumber:NextPage})
          }
        }
      }/>
    </div>
  );
}
