import './index.css';
import { Form, Input, Button, message } from 'antd';
import {
  useNavigate
} from "react-router-dom";
const PASSWORD = '123456'
const USERNAME = 'admin'

export default () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log('Success:', values);
    const { username, password } = values
    if (password === PASSWORD && USERNAME === username) {
      message.success('登录成功');
      window.localStorage.setItem('user', USERNAME)
      navigate('/dashboard')
      window.location.reload();
    } else {
      message.error('用户名和密码错误');
    }
  };

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
