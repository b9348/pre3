import { useState } from 'react';
import { Select, Row, Col, Card, Descriptions } from 'antd';
import ReactECharts from 'echarts-for-react';
import mockData from './mock.json'

const { Option } = Select;

// Mock数据 

const GaseousPhase = () => {
  const [filters, setFilters] = useState({
    disciplineCategory: '工科',
    specificMajor: '',
    selectedCourses: []
  });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0 });

  // 模拟API数据
  const mockMajors = {
    工科: ['软件工程', '计算机科学'],
    理科: ['数学', '物理']
  };

  // 处理图表数据
  const processGraphData = () => {
    const nodes = [];
    const links = [];

    const filteredMajor = mockData.major.filter(m =>
      m.major === filters.specificMajor &&
      (filters.selectedCourses.length === 0 ||
        m.entities.some(e => filters.selectedCourses.includes(e.name)))
    );
    // 合并所有triples
    const allTriples = [
      ...filteredMajor.flatMap(m => m.triples),
      ...mockData.job.triples
    ];

    // 处理节点
    const uniqueEntities = new Set();
    filteredMajor.forEach(m => m.entities.forEach(e => uniqueEntities.add(e.name)));
    mockData.job.entities.forEach(e => uniqueEntities.add(e.name));

    Array.from(uniqueEntities).forEach(name => {
      const entity = [...filteredMajor.flatMap(m => m.entities), ...mockData.job.entities]
        .find(e => e.name === name);
      nodes.push({
        name,
        symbolSize: 30,
        itemStyle: {
          color: entity.type === 'course' ? '#5470c6' :
            entity.type === 'major' ? '#91cc75' : '#fac858'
        }
      });
    });

    // 处理关系
    allTriples.forEach(([source, target, relation]) => {
      links.push({
        source,
        target: relation,
        lineStyle: {
          color: '#999',
          curveness: 0.2
        }
      });
      links.push({
        source: relation,
        target,
        lineStyle: {
          color: '#999',
          curveness: 0.2
        }
      });
    });

    return { nodes, links };
  };

  // 图表点击事件
  const onChartClick = (params) => {
    if (params.dataType === 'node') {
      setSelectedNode(params.data);
    }
  };

  const option = {
    tooltip: {},
    legend: {
      data: ['课程', '专业', '公司']
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
      data: processGraphData().nodes,
      links: processGraphData().links,
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

  return (
    <Card>
      {/* 筛选条件区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Select
            placeholder="学科大类"
            onChange={v => setFilters({ ...filters, disciplineCategory: v })}
          >
            <Option value="工科">工科</Option>
            <Option value="理科">理科</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder="具体专业"
            onChange={v => setFilters({ ...filters, specificMajor: v })}
          >
            {mockMajors[filters.disciplineCategory]?.map(major => (
              <Option key={major} value={major}>{major}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            mode="multiple"
            placeholder="选择课程"
            onChange={v => setFilters({ ...filters, selectedCourses: v })}
          >
            {mockData.major
              .filter(m => m.major === filters.specificMajor)
              .flatMap(m => m.entities.filter(e => e.type === 'course'))
              .map(course => (
                <Option key={course.name} value={course.name}>
                  {course.name}
                </Option>
              ))}
          </Select>
        </Col>
      </Row>

      {/* 统计信息 */}
      <Descriptions bordered size="small">
        <Descriptions.Item label="节点数量">{stats.nodes}</Descriptions.Item>
        <Descriptions.Item label="关系数量">{stats.edges}</Descriptions.Item>
      </Descriptions>

      {/* 图谱展示 */}
      <ReactECharts
        option={option}
        style={{ height: '600px', marginTop: 20 }}
        onEvents={{ click: onChartClick }}
      />

      {/* 节点详情面板 */}
      {selectedNode && (
        <Card title="节点详情" style={{ marginTop: 20 }}>
          {/* // 节点详情展示增强 */}
          {selectedNode && (
            <Descriptions column={2}>
              {Object.entries(selectedNode).map(([key, val]) => (
                <Descriptions.Item key={key} label={key}>
                  {JSON.stringify(val)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </Card>
      )}
    </Card>
  );
};

export default GaseousPhase;