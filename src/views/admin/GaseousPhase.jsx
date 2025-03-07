import { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Tabs } from 'antd';
import ReactECharts from 'echarts-for-react';
import mockData from './mock.json';

const { TabPane } = Tabs;

const GaseousPhase = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentKey, setCurrentKey] = useState('all'); // 默认选中"全部"

  // 处理初始图表数据
  const processGraphData = useCallback((type) => {
    const nodes = [];
    const links = [];

    const allTriples = type === 'all'
      ? [...mockData.data.major_triples, ...mockData.data.job_triples]
      : type === 'course'
        ? mockData.data.major_triples
        : mockData.data.job_triples;

    // 处理节点
    const uniqueEntities = new Set();
    allTriples.forEach(triple => {
      uniqueEntities.add(triple.head.lesson || triple.head.title);
      uniqueEntities.add(triple.tail.name);
    });

    Array.from(uniqueEntities).forEach(name => {
      nodes.push({
        name,
        symbolSize: 30,
        itemStyle: {
          color: '#5470c6'
        }
      });
    });

    // 处理关系
    allTriples.forEach(triple => {
      links.push({
        source: triple.head.lesson || triple.head.title,
        target: triple.tail.name,
        lineStyle: {
          color: '#999',
          curveness: 0.2
        }
      });
    });

    return { nodes, links };
  }, []);

  // 图表点击事件
  const onChartClick = (params) => {
    if (params.dataType === 'node') {
      const nodeName = params.data.name;
      // 查找课程或职位的详细信息
      const courseDetail = mockData.data.major_triples.find(
        triple => triple.head.lesson === nodeName
      );
      const jobDetail = mockData.data.job_triples.find(
        triple => triple.head.title === nodeName
      );
      // 设置选中的节点信息
      setSelectedNode(courseDetail?.head || jobDetail?.head || { name: nodeName });
    }
  };

  const option = {
    tooltip: {},
    legend: {
      data: ['课程', '职位', '知识点', '技能点', '价值观']
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        filterMode: 'empty'
      }
    ],
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      scaleLimit: {
        min: 0.5,
        max: 2
      },
      force: {
        repulsion: 1000,
        edgeLength: 200,
        layoutAnimation: true
      },
      data: graphData.nodes,
      links: graphData.links,
      label: {
        show: true,
        position: 'right'
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      },
      emphasis: {
        focus: 'adjacency',
        label: {
          show: true,
          fontSize: 16
        }
      }
    }]
  };
  useEffect(() => {
    const data = processGraphData(currentKey);
    setGraphData(data);
  }, [currentKey]); // 仅依赖 currentKey

  return (
    <Card>
      {/* 分类展示区域 */}
      <Tabs defaultActiveKey={currentKey} onChange={setCurrentKey}  >
        <TabPane tab="全部" key="all">
          <ReactECharts
            option={option}
            style={{ height: '600px', marginTop: 20 }}
            onEvents={{ click: onChartClick }}
          />
        </TabPane>
        <TabPane tab="课程" key="course">
          <ReactECharts
            option={option}
            style={{ height: '600px', marginTop: 20 }}
            onEvents={{ click: onChartClick }}
          />
        </TabPane>
        <TabPane tab="职位" key="job">
          <ReactECharts
            option={option}
            style={{ height: '600px', marginTop: 20 }}
            onEvents={{ click: onChartClick }}
          />
        </TabPane>
      </Tabs>

      {/* 节点详情面板 */}
      {selectedNode && (
        <Card title="节点详情" style={{ marginTop: 20 }}>
          <Descriptions column={2}>
            {Object.entries(selectedNode).map(([key, val]) => (
              <Descriptions.Item key={key} label={key}>
                {val}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}
    </Card>
  );
};

export default GaseousPhase;