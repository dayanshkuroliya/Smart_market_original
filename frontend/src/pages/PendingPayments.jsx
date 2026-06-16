// pages/PendingPayments.jsx
import { useEffect, useState } from 'react'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'

export default function PendingPayments() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/collections/pending')
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markPaid = async (collectionId, ownerName) => {
    setResolving(collectionId)
    try {
      await api.put(`/collections/${collectionId}`, { status: 'Paid' })
      toast.success(`${ownerName} marked as Paid`)
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setResolving(null)
    }
  }

  const totalDue = records.reduce((s, r) => s + r.amount_due, 0)
  const overdue = records.filter(r => r.days_pending > 1)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{records.length}</p>
          <p className="text-sm text-gray-500 mt-1">Outstanding Records</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">₹{totalDue.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 mt-1">Total Amount Due</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdue.length}</p>
          <p className="text-sm text-gray-500 mt-1">Overdue {'>'} 1 Day</p>
        </div>
      </div>

      {loading ? <Spinner /> : records.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3"></p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">All payments are clear!</p>
          <p className="text-sm text-gray-400 mt-1">No pending or unpaid collections found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pending &amp; Unpaid Records
            </span>
            {overdue.length > 0 && (
              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                {overdue.length} overdue
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Shop</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Amount Due</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Days Pending</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {records.map(r => {
                  const isOverdue = r.days_pending > 1
                  return (
                    <tr key={r.collection_id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 ${isOverdue ? 'bg-red-50/60 dark:bg-red-900/10' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.owner_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.shop_name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.phone_number || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">₹{r.amount_due.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(r.collection_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-yellow-600'}`}>
                          {r.days_pending === 0 ? 'Today' : `${r.days_pending}d`}
                          {isOverdue && ' ⚠️'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          disabled={resolving === r.collection_id}
                          onClick={() => markPaid(r.collection_id, r.owner_name)}
                          className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50"
                        >
                          {resolving === r.collection_id ? '…' : '✓ Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
