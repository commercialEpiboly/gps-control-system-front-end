import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.min.css';
import './index.css';
import Login from './pages/login';
import Layout from './pages/layout'
import { Spin, Alert } from 'antd';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


// test
// window.urlApi = 'http://119.91.226.187:19009'
// pro
// window.urlApi = 'https://www.jusenkaiyue.cn/api'
// dev
window.urlApi = 'http://localhost:19009'

const NotFound404 = () => {
  return <Spin tip="跳转中....">
    <Alert
      message="提示！"
      description="如果一直加载没有反应可能是未登陆."
      type="info"
    />
  </Spin>
}

const Index = () => {
  const user = localStorage.getItem('userInfo')
  return <BrowserRouter>
    <Routes>
      {
        user && <Route path="/*" element={<Layout />} />
      }
      <Route path="/login" element={<Login />} />
      {
        !user && <Route path="/" element={<Login />} />
      }
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  </BrowserRouter>
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
);
