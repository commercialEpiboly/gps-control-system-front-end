import './index.css';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import {
  useNavigate
} from "react-router-dom";

export default () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false)
  const onFinish = (values) => {
    setIsLogin(true)
    const { username, password } = values
    fetch(`${window.urlApi}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': window.sessionStorage.getItem('token')
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json) {
          const { data } = json
          window.sessionStorage.setItem('token', data?.token)
          getUsersInfo(username)
        } else {
          message.error('用户名和密码错误');
        }
      }).catch(() => {
        message.error('用户名和密码错误');
      }).finally(() => setIsLogin(false))
  };

  useEffect(() => {
    document.getElementById("view").setAttribute('content', 'user-scalable=yes, width=device-width, minimum-scale=1, initial-scale=1, maximum-scale=2');
    return () => {
      document.getElementById("view").setAttribute('content', 'initial-scale=0, minimum-scale=0,maximum-scale=0,user-scalable=no');
    }
  }, [])

  // manager
  const getUsersInfo = (username) => {
    fetch(`${window.urlApi}/user/getUsersInfo?username=${username}&pageNumber=1&pageSize=10`, {
      method: 'GET',
      headers: {
        'Authorization': window.sessionStorage.getItem('token')
      },
    }).then((response) => response.json()).then((json) => {
      if (json) {
        const [usersInfo] = json?.data?.data
        window.localStorage.setItem('userInfo', JSON.stringify(usersInfo))
        navigate('/')
        window.location.reload();
      }
    }).catch(() => {
      message.error('用户名和密码错误或没有这个用户');
    })
  }

  return (
    <div className='login-page'>
      <div className="form-box">
        <h4>聚森凯跃技定位管理系统</h4>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入账号!' }]}
          >
            <Input placeholder='账号(用户名)' />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password placeholder='请输入密码' />
          </Form.Item>

          <Form.Item >
            <Button loading={isLogin} className='btn' type="primary" htmlType="submit">
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
