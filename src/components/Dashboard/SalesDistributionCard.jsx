import { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import api from '../../api';

const SalesDistributionCard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/sales-distribution/');
        const chartData = [
          ['City', 'Sales'],
          ...response.data.map((item) => [item.city, item.sales]),
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
    legend: { position: 'none' },
    colors: ['#3e97ff', '#ffc700', '#f1416c', '#50cd89', '#7e8299'],
    chartArea: { width: '80%', height: '80%' },
    hAxis: { textPosition: 'out', slantedText: false },
    vAxis: { textPosition: 'out', gridlines: { count: 5 } },
    bar: { groupWidth: '70%' },
  };

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">Sales Distribution</h3>
        <span className="badge badge-light-success text-success">+7.4%</span>
      </div>
      <div style={{ height: '250px', margin: '-20px' }}>
        <Chart
          chartType="ColumnChart"
          data={data}
          options={options}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default SalesDistributionCard;