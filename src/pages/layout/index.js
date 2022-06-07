import React, { useState } from 'react';
import './index.css';
import {
  Link,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import CreateInfo from '../createInfo'
import Detail from '../detail'
import InfoList from '../infoList'
import EditInfo from '../editInfo'
import Dashboard from '../dashboard'
import Warn from '../warn'

import { Menu, Button, Layout } from 'antd';
import {
  PieChartOutlined,
  DesktopOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ContainerOutlined,
  AlertOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


export default () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate();
  const loginOut = () => {
    localStorage.setItem('user', '')
    navigate('/login')
  }
  return (
    <div className='layout-page'>
      <Header className='layout-page_header'>
        <div className="logo" >聚森凯跃科技定位管理系统</div>
        <div className='menu-box'>
            <Menu
              className='menu'
              defaultSelectedKeys={['1']}
              mode="horizontal"
              theme="dark"
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="1" icon={<PieChartOutlined />}>
                <Link to="/dashboard" >车辆总览</Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<DesktopOutlined />}>
                <Link to="/createInfo" >创建GPS关联</Link>
              </Menu.Item>
              <Menu.Item key="3" icon={<ContainerOutlined />}>
                <Link to="/list" >GPS列表</Link>
              </Menu.Item>
              <Menu.Item key="4" icon={<AlertOutlined />}>
                <Link to="/warn" >风控管理</Link>
              </Menu.Item>
            </Menu>
          </div>
        <div className='exit' onClick={loginOut}>退出</div>
      </Header>
      <Layout className='layout-page_body'>
        <Layout style={{ padding: '0 24px 24px', overflow: 'scroll'}}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/list" element={<InfoList />} />
              <Route path="/createInfo" element={<CreateInfo />} />
              <Route path="/editInfo" element={<EditInfo />} />
              <Route path="/detailInfo" element={<Detail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/warn" element={<Warn />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
