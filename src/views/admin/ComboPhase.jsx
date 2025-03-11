import { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Tabs, Select } from 'antd';
import ReactECharts from 'echarts-for-react';
import mockData from './mock.json';
 

const GaseousPhase = () => {
  // 原有状态
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentKey, setCurrentKey] = useState('all');
  const [chartReady, setChartReady] = useState(false); // 新增状态，用于控制图表渲染时机

  // 新增CSV相关状态
  const [csvData, setCsvData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');

  // 1. 加载CSV数据
  useEffect(() => {
    fetch('src/assets/课程.csv') // 确保路径与项目结构匹配
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => {
        const lines = text.split('\n');
        // const headers = lines[0].split(',');
        const data = lines.slice(1).map((line, index) => {
          // 跳过空行
          if (!line.trim()) return null;

          const values = line.split(',');

          // 确保每行有足够的列
          if (values.length < 3) {
            console.warn(`跳过第${index + 2}行，列数不足:`, values);
            return null;
          }

          return {
            category: values[0],
            discipline: values[1],
            major: values[2] ? values[2].trim() : '',
          };
        }).filter(Boolean); // 过滤掉空值
        setCsvData(data);
      })
      .catch((error) => {
        console.error('加载CSV失败:', error);
      });
  }, []);

  // 确保组件挂载后再渲染图表
  useEffect(() => {
    setChartReady(true);
  }, []);

  // 原有数据处理函数
  const processGraphData = useCallback(
    (type) => {
      const nodes = [];
      const links = [];

      const allTriples = type === 'all'
        ? [...mockData.data.major_triples, ...mockData.data.job_triples]
        : type === 'course'
          ? mockData.data.major_triples
          : mockData.data.job_triples;

      // 处理节点
      const uniqueEntities = new Set();
      allTriples.forEach((triple) => {
        uniqueEntities.add(triple.head.lesson || triple.head.title);
        uniqueEntities.add(triple.tail.name);
      });

      Array.from(uniqueEntities).forEach((name) => {
        nodes.push({
          name,
          symbolSize: 30,
          itemStyle: {
            color: '#5470c6',
          },
        });
      });

      // 处理关系
      allTriples.forEach((triple) => {
        links.push({
          source: triple.head.lesson || triple.head.title,
          target: triple.tail.name,
          lineStyle: {
            color: '#999',
            curveness: 0.2,
          },
        });
      });

      return { nodes, links };
    },
    [mockData]
  );

  // 原有点击事件
  const onChartClick = (params) => {
    if (params.dataType === 'node') {
      const nodeName = params.data.name;
      const courseDetail = mockData.data.major_triples.find(
        (triple) => triple.head.lesson === nodeName
      );
      const jobDetail = mockData.data.job_triples.find(
        (triple) => triple.head.title === nodeName
      );
      setSelectedNode(
        courseDetail?.head || jobDetail?.head || { name: nodeName }
      );
    }
  };

  const option = {
    tooltip: {},
    legend: {
      data: ['课程', '职位'],
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        filterMode: 'empty',
      },
    ],
    series: [
      {
        name: '课程',
        type: 'graph',
        layout: 'force',
        roam: true,
        scaleLimit: {
          min: 0.5,
          max: 2,
        },
        force: {
          repulsion: 1000,
          edgeLength: 200,
          layoutAnimation: true,
        },
        data: graphData.nodes,
        links: graphData.links,
        label: {
          show: true,
          position: 'right',
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
        },
        emphasis: {
          focus: 'adjacency',
          label: {
            show: true,
            fontSize: 16,
          },
        },
      },
      {
        name: '职位',
        type: 'graph',
        layout: 'force',
        roam: true,
        scaleLimit: {
          min: 0.5,
          max: 2,
        },
        force: {
          repulsion: 1000,
          edgeLength: 200,
          layoutAnimation: true,
        },
        data: graphData.nodes,
        links: graphData.links,
        label: {
          show: true,
          position: 'right',
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
        },
        emphasis: {
          focus: 'adjacency',
          label: {
            show: true,
            fontSize: 16,
          },
        },
      },
    ],
  };

  const tabItems = [
    {
      key: 'all',
      label: '全部',
      children: (
        <>
          {/* 迁移并适配的三级筛选组件 */}
          <Card title="全部筛选" style={{ marginBottom: 20 }}>
            <Select
              style={{ width: 200, marginBottom: 10 }}
              placeholder="选择学科门类"
              options={csvData.map((item) => ({
                label: item.category,
                value: item.category,
              })).filter(
                (v, i, a) => a.findIndex((o) => o.value === v.value) === i
              )}
              onChange={(value) => {
                setSelectedCategory(value);
                setSelectedDiscipline('');
                setSelectedMajor('');
                console.log('数据层更新：学科门类 ->', value);
              }}
            />

            <Select
              style={{ width: 200, marginBottom: 10 }}
              placeholder="选择学科"
              value={selectedDiscipline}
              options={
                selectedCategory
                  ? csvData
                    .filter((item) => item.category === selectedCategory)
                    .map((item) => ({
                      label: item.discipline,
                      value: item.discipline,
                    }))
                    .filter(
                      (v, i, a) => a.findIndex((o) => o.value === v.value) === i
                    )
                  : []
              }
              onChange={(value) => {
                setSelectedDiscipline(value);
                setSelectedMajor('');
                console.log('数据层更新：学科 ->', value);
              }}
            />

            <Select
              style={{ width: 200 }}
              placeholder="选择专业"
              value={selectedMajor}
              options={
                selectedCategory && selectedDiscipline
                  ? csvData
                    .filter(
                      (item) =>
                        item.category === selectedCategory &&
                        item.discipline === selectedDiscipline
                    )
                    .map((item) => ({
                      label: item.major,
                      value: item.major,
                    }))
                  : []
              }
              onChange={(value) => {
                setSelectedMajor(value);
                console.log('数据层更新：专业 ->', value);
              }}
            />
          </Card>

          {/* 原有图表组件 */}
          <ReactECharts
            option={option}
            style={{ height: '600px', marginTop: 20 }}
            onEvents={{ click: onChartClick }}
          />
        </>
      ),
    },
  ];

  // 原有效果钩子
  useEffect(() => {
    if (chartReady) {
      const data = processGraphData(currentKey);
      setGraphData(data);
    }
  }, [currentKey, processGraphData, chartReady]);

  return (
    <Card>
      {/* 原有分类展示区域 */}
      {chartReady && ( // 确保图表容器已准备好
        <Tabs
          defaultActiveKey={currentKey}
          onChange={setCurrentKey}
          items={tabItems.map((item) => ({ // 使用 items 属性替代 TabPane
            key: item.key,
            label: item.label,
            children: item.children,
          }))}
        />
      )}

      {/* 原有节点详情面板 */}
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