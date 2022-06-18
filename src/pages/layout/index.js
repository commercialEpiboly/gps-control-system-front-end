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
import StaffList from '../staffList'
import StaffDetail from '../staffDetail'
import _ from 'lodash'
import { Menu, Button, Layout, message } from 'antd';
import {
  PieChartOutlined,
  DesktopOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ContainerOutlined,
  AlertOutlined,
  UserAddOutlined
} from '@ant-design/icons';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


export default () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate();
  const user = JSON.parse(window.localStorage.getItem('userInfo'))

  let addressableMenu;

  // 不是超级管理员
  if (user?.menu && user?.menu !== '*') {
    addressableMenu = user?.menu?.split(',') || []
  }

  // 是超级管理员
  if (user?.menu && user?.menu === '*') {
    addressableMenu = '*'
  }

  const isLogin = window.sessionStorage.getItem('token')
  // 判断是否登录
  if (!isLogin) {
    message.error('未登录账号请先登陆！');
    setTimeout(() => {
      navigate('/login')
    }, 100);
  }

  // 退出登录
  const loginOut = () => {
    localStorage.setItem('userInfo', '')
    sessionStorage.setItem('token', '')
    navigate('/login')
  }

  const menus = {
    '车辆总览': {
      menuCom: <Menu.Item key="1" icon={<PieChartOutlined />}>
        <Link to="/dashboard" >车辆总览</Link>
      </Menu.Item>,
      component: <Route path="/dashboard" element={<Dashboard />} />,
      defaultRoute: <Dashboard />
    },
    '创建GPS关联': {
      menuCom: <Menu.Item key="2" icon={<DesktopOutlined />}>
        <Link to="/createInfo" >创建GPS关联</Link>
      </Menu.Item>,
      component: <Route path="/createInfo" element={<CreateInfo />} />,
      defaultRoute: <CreateInfo />
    },
    'GPS列表': {
      menuCom: <Menu.Item key="3" icon={<ContainerOutlined />}>
        <Link to="/list" >GPS列表</Link>
      </Menu.Item>,
      component: <>
        <Route path="/editInfo" element={<EditInfo />} />
        <Route path="/detailInfo" element={<Detail />} />
        <Route path="/list" element={<InfoList />} />
      </>,
      defaultRoute: <InfoList />
    },
    '风控管理': {
      menuCom: <Menu.Item key="4" icon={<AlertOutlined />}>
        <Link to="/warn" >风控管理</Link>
      </Menu.Item>,
      component: <Route path="/warn" element={<Warn />} />,
      defaultRoute: <Warn />
    },
    '账号管理': {
      menuCom: <Menu.Item key="" icon={<UserAddOutlined />}>
        <Link to="/staffList" >账号管理</Link>
      </Menu.Item>,
      component: <>
        <Route path="/staffDetail" element={<StaffDetail />} />
        <Route path="/staffList" element={<StaffList />} />
      </>,
      defaultRoute: <StaffList />
    }
  }

  const renderMenu = () => {
    if (!addressableMenu) {
      return <></>
    }
    if (addressableMenu === '*') {
      return _.map(menus, ({ menuCom }) => menuCom)
    }

    if (_.isArray(addressableMenu)) {
      return addressableMenu?.map((menuName) => menus[menuName].menuCom)
    }
  }

  const renderRoute = () => {
    if (!addressableMenu) {
      return <></>
    }
    if (addressableMenu === '*') {
      return _.map(menus, ({ component }) => component)
    }

    if (_.isArray(addressableMenu)) {
      return addressableMenu?.map((menuName) => menus[menuName].component)
    }
  }

  const getDefaultRoute = () => {

    if (!addressableMenu) {
      return <></>
    }
    if (addressableMenu === '*') {
      return <Dashboard />
    }
    if (_.isArray(addressableMenu)) {
      return addressableMenu?.map((menuName) => menus[menuName].defaultRoute)[0]
    }
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
            {
              renderMenu()
            }
          </Menu>
        </div>
        {
          isLogin ? <div className='exit'> 用户名【{user?.username}】  <Button onClick={loginOut} danger>退出登录</Button></div> : <div className='exit' onClick={loginOut}>登录</div>
        }

      </Header>
      <Layout className='layout-page_body'>
        <Layout style={{ padding: '0 24px 24px', overflow: 'scroll' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              {
                isLogin && <>
                  {
                    renderRoute()
                  }
                  <Route path="/" element={getDefaultRoute()} />
                </>
              }

            </Routes>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
