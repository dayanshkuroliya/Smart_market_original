// pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Vendors"     value={data.total_vendors}          icon="🏪" color="blue" />
        <StatCard label="Collected Today"   value={fmt(data.total_collected_today)} icon="💵" color="green" />
        <StatCard label="Paid Today"        value={data.paid_today}             icon="✅" color="green" />
        <StatCard label="Pending Today"     value={data.pending_today}          icon="⏳" color="yellow" />
        <StatCard label="Not Paid Today"    value={data.not_paid_today}         icon="❌" color="red" />
        <StatCard label="Total Due"         value={fmt(data.total_due_amount)}  icon="💸" color="red"
          sub={`${data.total_vendors_with_pending} vendors`} />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/collection" className="card p-5 flex items-center gap-4 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💰</div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Record Collection</p>
            <p className="text-xs text-gray-500">Mark today's payments</p>
          </div>
        </Link>
        <Link to="/pending" className="card p-5 flex items-center gap-4 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-yellow-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⏳</div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">View Pending</p>
            <p className="text-xs text-gray-500">{data.total_vendors_with_pending} vendors owe money</p>
          </div>
        </Link>
        <Link to="/vendors/add" className="card p-5 flex items-center gap-4 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">➕</div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Add Vendor</p>
            <p className="text-xs text-gray-500">Register a new shop owner</p>
          </div>
        </Link>
      </div>

      {/* 7-day trend table */}
      {data.collection_trend?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Recent Collection Trend (Last 7 Days)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Collected</th>
                  <th className="pb-2 pr-4 font-medium">Pending</th>
                  <th className="pb-2 pr-4 font-medium">Paid</th>
                  <th className="pb-2 pr-4 font-medium">Unpaid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {[...data.collection_trend].reverse().slice(0, 7).map(row => (
                  <tr key={row.collection_date} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                      {new Date(row.collection_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2 pr-4 text-green-600 dark:text-green-400 font-medium">₹{row.total_collected.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4 text-yellow-600 dark:text-yellow-400">₹{row.total_pending.toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-4">
                      <span className="badge-paid">{row.paid_count}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className="badge-notpaid">{row.not_paid_count + row.pending_count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
