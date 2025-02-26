import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message, Card, Row, Col, Typography, Divider, Modal, Spin } from 'antd';
import './GaseousPhase.scss'


const { Title } = Typography;

const Homepage = () => {
  const navigate = useNavigate();
  const btnList = [
    { type: 'fat', text: '专业能力图谱', url: '/m/gaseousPhase' },
    { type: 'protein', text: '职位胜任力图谱', url: '/m/liquidPhase' },
    { type: 'combo', text: '图谱对比', url: '/m/comboPhase' },
  ];

  // 顶部条幅样式
  const headerStyle = {
    backgroundColor: '#f0f2f5',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  return (
    <div>
      <div style={headerStyle}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {'功能概览'}
            </Title>
          </Col>
        </Row>
      </div>
      {/* 主体内容 */}
      <Card style={{
        maxWidth: 1200,
        margin: '80px auto 20px', // 留出顶部条幅空间
        paddingTop: 20
      }}>
        <div style={{ textAlign: 'center' }}>
          <Divider style={{ margin: '16px 0' }} /> {/* 新增Divider */}
          <Row gutter={40}>
            {btnList.map((btn, index) => (
              <Col span={12} key={index} style={{ marginBottom: 20 }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ height: 120, fontSize: 24 }}
                  onClick={() => {
                    navigate(btn.url)
                  }}
                >
                  {btn.text}
                </Button>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default Homepage;