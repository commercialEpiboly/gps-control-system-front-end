import './index.css';
import { Form, Input, Button, message } from 'antd';
import {
  useNavigate
} from "react-router-dom";

export default () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log('Success:', values);
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
      })
  };
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
        window.localStorage.setItem('user', JSON.stringify(usersInfo))
        navigate('/dashboard')
        window.location.reload();
      }
    }).catch(() => {
      message.error('用户名和密码错误或没有这个用户');
    })
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className='login-page'>
      <div className="form-box">
        <h4>聚森凯跃技定位管理系统</h4>
        <Form
          name="basic"
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
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
            <Button className='btn' type="primary" htmlType="submit">
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
