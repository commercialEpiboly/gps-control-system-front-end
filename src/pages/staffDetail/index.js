import React, { useState, useEffect } from 'react';
import './index.css';
import { Form, Input, Button, Alert, message, InputNumber } from 'antd';
import {
    useNavigate,
} from "react-router-dom";

export default () => {
    const [form] = Form.useForm();
    const staffDetailData = window.localStorage.getItem('staffDetail')
    const defaultData = staffDetailData ? JSON.parse(staffDetailData): ''

    const navigate = useNavigate()
    const onFinish = (data) => {

        const newData = {
            ...defaultData,
            ...data
        }
        if (defaultData) {
            fetch(`${window.urlApi}/user/updateUser`, {
                method: 'POST',
                body: JSON.stringify(newData),
                headers: {
                    'Authorization': window.sessionStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            })
                .then(response => {
                    message.success('修改成功！');
                    navigate('/staffList')
                })

        } else {
            fetch(`${window.urlApi}/user/addUser`, {
                method: 'POST',
                body: JSON.stringify(newData),
                headers: {
                    'Authorization': window.sessionStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            })
                .then(response => {
                    message.success('创建成功！');
                    navigate('/staffList')
                })
        }
    }

    useEffect(() => {
        form.setFieldsValue(defaultData)
    }, [])

    const itemList = [
        {
            name: 'area',
            placeholder: '请输入地区',
            message: '请输入地区',
            label: '地区',
            required: true
        },
        {
            name: 'menu',
            placeholder: '请输入菜单',
            message: '请输入菜单',
            label: '菜单',
            required: true
        },
        {
            name: 'password',
            placeholder: '请输入密码(如果不输入就是原本的密码)',
            message: '请输入密码',
            label: '密码',
        },
        {
            name: 'phoneNumber',
            label: '手机号',
            placeholder: '请输入手机号',
            required: true
        },
        {
            name: 'username',
            label: '用户姓名',
            placeholder: '请输入用户姓名',
            required: true
        }
    ]

    return (
        <div className="edit-page">
            <Form
                form={form}
                layout='vertical'
                name="basic"
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
                            {type === 'number' ? <InputNumber placeholder={placeholder} /> : <Input placeholder={placeholder} disabled={disabled} />}
                        </Form.Item>
                    })
                }

                <Form.Item >
                    <Button className='btn' type="primary" htmlType="submit">
                        {defaultData ? '确认修改' : '确认创建'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
