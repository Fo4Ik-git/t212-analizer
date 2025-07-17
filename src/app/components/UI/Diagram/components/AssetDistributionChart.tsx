import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_CONFIG } from '../constants';
import { AssetDistributionItem } from '../types';

interface AssetDistributionChartProps {
  data: AssetDistributionItem[];
}

export function AssetDistributionChart({ data }: AssetDistributionChartProps) {
  return (
    <div className="bg-primary p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Распределение активов</h2>
      <ResponsiveContainer width="100%" height={CHART_CONFIG.pieChart.height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent as number * 100).toFixed(1)}%)`}
            outerRadius={CHART_CONFIG.pieChart.outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_CONFIG.colors[index % CHART_CONFIG.colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              const currency = props?.payload?.currency || 'PLN';
              return [`${(value as number).toFixed(2)} ${currency}`, 'Сумма'];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
