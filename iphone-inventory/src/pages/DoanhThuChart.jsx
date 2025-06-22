import React from "react";
import { Bar } from "react-chartjs-2";
import {

Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Tooltip,
Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function DoanhThuChart({ chartData }) {
const data = {
    labels: chartData.map(item => item.date),
    datasets: [
        {
            label: "Doanh thu (VNĐ)",
            data: chartData.map(item => item.revenue),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
        },
    ],
};

const options = {
    responsive: true,
    scales: {
        y: {
            ticks: {
                callback: value => value.toLocaleString() + " đ",
            },
        },
    },
};

return (
    <div className="bg-white rounded shadow p-4 mt-6">
        <h3 className="text-lg font-bold mb-3">📊 Biểu đồ doanh thu theo ngày</h3>
        <Bar data={data} options={options} />
    </div>
);
}

export default DoanhThuChart;