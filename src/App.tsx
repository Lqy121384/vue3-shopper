import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: 'home', label: '首页', icon: <HomeOutlined /> },
  { key: 'products', label: '商品', icon: <ShoppingOutlined /> },
  { key: 'combinations', label: '组合搭配', icon: <AppstoreOutlined /> },
  { key: 'cart', label: '购物车', icon: <ShoppingCartOutlined /> },
  { key: 'orders', label: '订单', icon: <FileTextOutlined /> },
  { key: 'profile', label: '个人中心', icon: <UserOutlined /> }
];

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['home']}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={`/${item.key}`}>{item.label}</Link>
            }))}
          />
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <div className="site-layout-content" style={{ padding: 24, minHeight: 380 }}>
            <Routes>
              <Route path="/" element={<div>首页内容</div>} />
              <Route path="/products" element={<div>商品列表</div>} />
              <Route path="/combinations" element={<div>组合搭配</div>} />
              <Route path="/cart" element={<div>购物车</div>} />
              <Route path="/orders" element={<div>订单列表</div>} />
              <Route path="/profile" element={<div>个人中心</div>} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          电子商城 ©{new Date().getFullYear()} Created by Your Company
        </Footer>
      </Layout>
    </Router>
  );
};

export default App; 