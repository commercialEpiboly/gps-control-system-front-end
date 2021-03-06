import React, { useState } from 'react';
import './index.css';
import { Form, Input, Button, message, Alert ,InputNumber} from 'antd';
import {
  useNavigate,
} from "react-router-dom";

export default () => {
  const navigate = useNavigate()
  const onFinish = (data) => {
    fetch(`${window.urlApi}/device/saveDeviceBase`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        message.success('创建成功！');
        navigate('/list')
      })
  }

  const itemList = [
    {
      name: 'deviceId',
      placeholder: '设备识别码',
      message: '请输入设备识别码',
      label: '识别码',
      required: true
    },
    {
      name: 'usePeriod',
      placeholder:'请输入使用年限',
      message: '请输入使用年限',
      label: '请输入使用年限（整数年）',
      required: true,
      type: 'number'
    },
    {
      name: 'idCard',
      placeholder: '请输入身份证',
      message: '请输入身份证',
      label: '身份证',
      required: true,
      rules: [
        {
          pattern: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, 
          message: '请输入正确身份证'
        }
      ],
    },
    {
      name: 'phoneNumber',
      placeholder: '请输入手机号',
      message: '请输入手机号',
      label: '手机号',
      rules: [
        {
          pattern: /^1[3|4|5|7|8][0-9]\d{8}$/, message: '请输入正确的手机号'
        }
      ],
      required: true
    },
    {
      name: 'frameNumber',
      placeholder: '请输入车架号',
      message: '请输入车架号',
      label: '车架号',
      required: true
    },
    {
      name: 'numberPlate',
      placeholder: '请输入车牌号',
      message: '请输入车牌号',
      label: '车牌号',
      required: true
    },
    {
      name: 'engineNumber',
      placeholder: '请输入发动机号/电动机号',
      message: '请输入发动机号/电动机号',
      label: '发动机号/电动机号',
      required: true
    },
    {
      name: 'brand',
      placeholder: '请输入品牌',
      message: '请输入品牌',
      label: '品牌',
      required: true
    },
    {
      name: 'color',
      placeholder: '请输入颜色',
      message: '请输入颜色',
      label: '颜色',
      required: true
    },
    {
      name: 'dealerAddress',
      placeholder: '请输入经销商地址',
      message: '请输入经销商地址',
      label: '经销商地址',
      required: true
    },
    {
      name: 'status',
      label: '状态',
      placeholder: '状态',
      required: true
    },
    {
      name: 'remark',
      label: '备注',
      placeholder: '备注',
    }
  ]

  return (
    <div className="create-page">
      <Alert message="(注意)请使用sin号码作为设备识别码（创建后则不可改变）" type="warning" />
      <Alert message="(注意)定位设备通电后再创建" type="warning" />
      <Form
        name="basic"
        layout='vertical'
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {
          itemList.map(({ rules,message, required, name, placeholder, label, type}, index) => {
            return <Form.Item
              label={label}
              key={index}
              name={name}
              rules={ rules ? [...rules,{ required, message }] :[{ required, message }]}
            >
              {type === 'number'? <InputNumber placeholder={placeholder}/> :<Input placeholder={placeholder} />}
            </Form.Item>
          })
        }

        <Form.Item >
          <Button className='btn' type="primary" htmlType="submit">
            确认创建
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
