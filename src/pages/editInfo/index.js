import React, { useState, useEffect } from 'react';
import './index.css';
import { Form, Input, Button, Alert, message, InputNumber } from 'antd';
import {
  useNavigate,
} from "react-router-dom";

export default () => {
  const { area, username } = JSON.parse(localStorage.getItem('userInfo'))
  const [form] = Form.useForm();
  const defaultData = JSON.parse(window.localStorage.getItem('data'))
  const navigate = useNavigate()

  useEffect(() => {
    document.getElementById("view").setAttribute('content', 'user-scalable=yes, width=device-width, minimum-scale=1, initial-scale=1, maximum-scale=2');
    return () => {
      document.getElementById("view").setAttribute('content', 'initial-scale=0, minimum-scale=0,maximum-scale=0,user-scalable=no');
    }
  }, [])

  const onFinish = (data) => {

    const newData = {
      ...defaultData,
      ...data,
      area: area === '*' ? data.area : area,
      createUser: username,
    }

    fetch(`${window.urlApi}/device/saveDeviceBase`, {
      method: 'POST',
      body: JSON.stringify(newData),
      headers: {
        'Authorization': window.sessionStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        message.success('修改成功！');
        navigate('/list')
      })
  }

  useEffect(() => {
    form.setFieldsValue(defaultData)
  }, [])
  const itemList = [
    {
      name: 'deviceId',
      placeholder: '设备识别码',
      message: '设备识别码',
      label: '识别码',
      required: true,
      disabled: true,
    },
    {
      name: 'name',
      placeholder: '请输入姓名',
      message: '请输入姓名',
      label: '请输入姓名',
      required: true,
    },
    {
      name: 'usePeriod',
      placeholder: '请输入使用年限',
      message: '请输入使用年限',
      label: '请输入使用年限（整数年）',
      type: 'number',
      required: true
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
      required: true,
      rules: [
        {
          pattern: /^1[3|4|5|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号'
        }
      ]
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
      placeholder: '请输入状态',
    },
    {
      name: 'remark',
      label: '备注',
      placeholder: '备注',
    }
  ]

  if (area === '*') {
    itemList.push({
      name: 'area',
      placeholder: '区域',
      message: '请输入区域',
      label: '区域',
      required: true
    })
  }

  return (
    <div className="edit-page">
      <Alert message="设备识别码创建后则不可改变" type="success" />
      <Form
        form={form}
        layout='vertical'
        name="basic"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {
          itemList.map(({ rules, message, required, name, placeholder, disabled, label, type }, index) => {
            return <Form.Item
              label={label}
              name={name}
              key={index}
              rules={rules ? [...rules, { required, message }] : [{ required, message }]}
            >
              {type === 'number' ? <InputNumber size="large" placeholder={placeholder} /> : <Input size="large" placeholder={placeholder} disabled={disabled} />}
            </Form.Item>
          })
        }

        <Form.Item >
          <Button className='btn' type="primary" htmlType="submit">
            确认修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
