// pages/Analytics.jsx – Charts using Chart.js
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import api from '../utils/api'
import Spinner from '../components/Spinner'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

const chartOptions = (title) => ({
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: true, text: title } },
  scales: { y: { beginAtZero: true } },
})

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!data?.collection_trend?.length) {
    return <div className="card p-12 text-center text-gray-400">No data to display yet.</div>
  }

  const trend = data.collection_trend
  const labels = trend.map(t =>
    new Date(t.collection_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  )

  const collectionBarData = {
    labels,
    datasets: [
      {
        label: 'Collected (₹)',
        data: trend.map(t => t.total_collected),
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Pending (₹)',
        data: trend.map(t => t.total_pending),
        backgroundColor: 'rgba(234,179,8,0.7)',
        borderRadius: 6,
      },
    ],
  }

  const pendingTrendData = {
    labels,
    datasets: [{
      label: 'Pending Amount (₹)',
      data: trend.map(t => t.total_pending),
      fill: true,
      borderColor: 'rgb(239,68,68)',
      backgroundColor: 'rgba(239,68,68,0.1)',
      tension: 0.4,
    }],
  }

  const totalPaid = trend.reduce((s, t) => s + t.paid_count, 0)
  const totalPending = trend.reduce((s, t) => s + t.pending_count, 0)
  const totalNotPaid = trend.reduce((s, t) => s + t.not_paid_count, 0)

  const donutData = {
    labels: ['Paid', 'Pending', 'Not Paid'],
    datasets: [{
      data: [totalPaid, totalPending, totalNotPaid],
      backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(234,179,8,0.8)', 'rgba(239,68,68,0.8)'],
      borderWidth: 2,
    }],
  }

  const countBarData = {
    labels,
    datasets: [
      { label: 'Paid', data: trend.map(t => t.paid_count), backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4 },
      { label: 'Pending', data: trend.map(t => t.pending_count), backgroundColor: 'rgba(234,179,8,0.7)', borderRadius: 4 },
      { label: 'Not Paid', data: trend.map(t => t.not_paid_count), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
    ],
  }

  // Export buttons
  const exportCSV = () => { window.open('/api/dashboard/export/csv', '_blank') }
  const exportExcel = () => { window.open('/api/dashboard/export/excel', '_blank') }

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="flex justify-end gap-3">
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
           Export CSV
        </button>
        <button onClick={exportExcel} className="btn-primary flex items-center gap-2 text-sm">
           Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection per day */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Collection Per Day (₹)</h3>
          <Bar data={collectionBarData} options={chartOptions('Daily Collection vs Pending')} />
        </div>

        {/* Pending amount trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Pending Amount Trend</h3>
          <Line data={pendingTrendData} options={chartOptions('Pending Amount Over Time')} />
        </div>

        {/* Paid vs Pending ratio */}
        <div className="card p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Payment Status Distribution</h3>
          <div className="max-w-xs w-full">
            <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{totalPaid}</p>
              <p className="text-gray-400">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">{totalPending}</p>
              <p className="text-gray-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{totalNotPaid}</p>
              <p className="text-gray-400">Not Paid</p>
            </div>
          </div>
        </div>

        {/* Vendor count per status per day */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Vendor Count by Status Per Day</h3>
          <Bar
            data={countBarData}
            options={{ ...chartOptions(''), scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'top' } } }}
          />
        </div>
      </div>
    </div>
  )
}
