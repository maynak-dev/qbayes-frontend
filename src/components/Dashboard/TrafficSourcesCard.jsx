import { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import api from '../../api';

const TrafficSourcesCard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/traffic-sources/');
        const chartData = [
          ['Source', 'Visitors'],
          ...response.data.map((item) => [item.name, item.visitors]),
        ];
        setData(chartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  const options = {
    pieHole: 0.4,
    is3D: false,
    colors: ['#3e97ff', '#ffc700', '#f1416c', '#50cd89', '#7e8299'],
    legend: { position: 'bottom', alignment: 'center', textStyle: { fontSize: 11 } },
    chartArea: { width: '100%', height: '80%' },
    tooltip: { trigger: 'none' },
    slices: {
      0: { offset: 0.02 },
    },
  };

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">Traffic Sources</h3>
        <span className="badge badge-primary">Real-time</span>
      </div>
      <div style={{ height: '300px', margin: '-20px' }}>
        <Chart
          chartType="PieChart"
          data={data}
          options={options}
          width="100%"
          height="100%"
          legendToggle
        />
      </div>
    </div>
  );
};

export default TrafficSourcesCard;