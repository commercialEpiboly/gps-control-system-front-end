import React, { useState, useEffect } from 'react';
import './index.css';
import {
    useNavigate,
} from "react-router-dom";
import { Table, Form, Input, Button, Popconfirm, InputNumber } from 'antd';

export default () => {
    const navigate = useNavigate();

    const [qeury, setQeury] = useState({
        area: "",
        phoneNumber: "",
        role: "",
        username: "",
        pageNumber: 1,
        pageSize: 8,
    })
    const [data, setData] = useState({})


    const qeuryHandle = () => {
        fetch(`${window.urlApi}/user/getUsersInfo?${new URLSearchParams(qeury)}`, {
            headers: {
                'Authorization': window.sessionStorage.getItem('token')
            },
        }).then((response) => response.json()).then(({ data }) => {
            setData(data)
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
            window.localStorage.setItem('staffDetail', '')
            window.localStorage.setItem('staffDetail', JSON.stringify(data))
        } else {
            window.localStorage.setItem('staffDetail', '')
        }

        navigate(url)
    }

    const delConfirm = (id) => {
        fetch(`${window.urlApi}/user/deleteUser`, {
            method: 'POST',
            body: JSON.stringify({id}),
            headers: {
                'Authorization': window.sessionStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
        }).then((response) => response.json()).then(({ data }) => {
            qeuryHandle(data)
        })
    }   


    const columns = [
        {
            title: '用户姓名',
            dataIndex: 'username',
            key: 'username',
            width: 150,
            fixed: 'left',
        },
        {
            title: '地区',
            dataIndex: 'area',
            width: 150,
            key: '地区',
        },
        {
            
            title: '可以访问的页面',
            dataIndex: 'menu',
            key: '可以访问的页面',
        },
        {
            title: '手机号',
            dataIndex: 'phoneNumber',
            width: 150,
            key: 'phoneNumber',
        },
        {
            title: '编辑',
            dataIndex: 'status',
            key: 'status',
            width: 90,
            fixed: 'right',
            render: (text, item) => {
                return <>
                    <Button type="link" onClick={() => jumpPage('/staffDetail', item)}> 编辑 </Button>
                    <Popconfirm
                        title="是否确认删除该账户?"
                        onConfirm={()=> delConfirm(item?.id)}
                        onCancel={() => { }}
                        okText="是"
                        cancelText="否"
                    >
                        <Button type="link"> 删除 </Button>
                    </Popconfirm>

                </>
            }
        },
    ];

    return (
        <div className="info-list">
            <Form
                layout={'inline'}
                className='info-list_filter'
                onFinish={onFinish}
            >
                <Form.Item label="地区" name="area">
                    <Input placeholder="地区" allowClear />
                </Form.Item>
                <Form.Item label="手机号" name="phoneNumber">
                    <InputNumber placeholder="手机号" allowClear />
                </Form.Item>
                <Form.Item label="角色" name="role">
                    <Input placeholder="角色" allowClear />
                </Form.Item>
                <Form.Item label="用户姓名" name="username">
                    <Input placeholder="用户姓名" allowClear />
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" type="primary">搜索</Button>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => jumpPage('/staffDetail', '')}>新建账号</Button>
                </Form.Item>
            </Form>
            <Table dataSource={data?.data} columns={columns} pagination={
                {
                    current: data?.number,
                    total: data?.totalElements,
                    onChange: (NextPage) => {
                        setQeury({ ...qeury, pageNumber: NextPage })
                    }
                }
            } />
        </div>
    );
}
