// pages/PaymentHistory.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'

export default function PaymentHistory() {
  const [searchParams] = useSearchParams()
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(searchParams.get('vendor') || '')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    api.get('/vendors/').then(r => setVendors(r.data))
  }, [])

  useEffect(() => {
    if (!selectedVendor) { setHistory([]); return }
    setLoading(true)
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    api.get(`/collections/vendor/${selectedVendor}/history`, { params })
      .then(r => setHistory(r.data))
      .finally(() => setLoading(false))
  }, [selectedVendor, startDate, endDate])

  const selectedVendorData = vendors.find(v => String(v.id) === String(selectedVendor))
  const totalPaid = history.filter(h => h.status === 'Paid').reduce((s, h) => s + h.amount, 0)
  const totalPending = history.filter(h => h.status !== 'Paid').reduce((s, h) => s + h.amount, 0)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Select Vendor</label>
          <select className="input" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
            <option value="">— Choose vendor —</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.owner_name} – {v.shop_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">From Date</label>
          <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="label">To Date</label>
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Vendor summary */}
      {selectedVendorData && (
        <div className="card p-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedVendorData.owner_name}</p>
            <p className="text-sm text-gray-500">{selectedVendorData.shop_name} · ₹{selectedVendorData.daily_charge}/day</p>
          </div>
          <div className="flex gap-6 ml-auto flex-wrap text-sm">
            <div className="text-center">
              <p className="font-bold text-green-600 dark:text-green-400 text-lg">₹{totalPaid.toLocaleString('en-IN')}</p>
              <p className="text-gray-400">Total Paid</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-500 text-lg">₹{totalPending.toLocaleString('en-IN')}</p>
              <p className="text-gray-400">Total Due</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700 dark:text-gray-200 text-lg">{history.length}</p>
              <p className="text-gray-400">Records</p>
            </div>
          </div>
        </div>
      )}

      {!selectedVendor ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-3xl mb-2"></p>
          <p>Select a vendor to view their payment history</p>
        </div>
      ) : loading ? <Spinner /> : history.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No records found for the selected period.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {history.map((h, i) => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200">
                      {new Date(h.collection_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${h.status === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      ₹{h.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{h.notes || '—'}</td>
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
