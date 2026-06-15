// pages/DailyCollection.jsx – Mark payment status for each vendor
import { useEffect, useState, useCallback } from 'react'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['Paid', 'Pending', 'Not Paid']

const statusColor = {
  'Paid':     'border-green-400 bg-green-50 dark:bg-green-900/20',
  'Pending':  'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  'Not Paid': 'border-red-400 bg-red-50 dark:bg-red-900/20',
}

export default function DailyCollection() {
  const todayStr = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(todayStr)
  const [vendors, setVendors] = useState([])
  const [collections, setCollections] = useState({}) // keyed by vendor_id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [summary, setSummary] = useState({ collected: 0, pending: 0, paid: 0, notPaid: 0 })

  // Fetch all vendors + today's collections
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [vendorRes, colRes] = await Promise.all([
        api.get('/vendors/'),
        api.get('/collections/today', { params: { target_date: date } })
      ])
      setVendors(vendorRes.data)
      // Build a map: vendor_id -> collection record
      const colMap = {}
      colRes.data.forEach(c => { colMap[c.vendor_id] = c })
      setCollections(colMap)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { loadData() }, [loadData])

  // Recompute summary whenever collections or vendors change
  useEffect(() => {
    let collected = 0, pending = 0, paid = 0, notPaid = 0
    vendors.forEach(v => {
      const c = collections[v.id]
      if (!c) return
      if (c.status === 'Paid') { collected += c.amount; paid++ }
      else if (c.status === 'Pending') { pending += c.amount; }
      else if (c.status === 'Not Paid') { notPaid++ }
    })
    setSummary({ collected, pending, paid, notPaid })
  }, [collections, vendors])

  const markStatus = async (vendor, status) => {
    setSaving(s => ({ ...s, [vendor.id]: true }))
    try {
      const existing = collections[vendor.id]
      const payload = {
        vendor_id: vendor.id,
        collection_date: date,
        amount: vendor.daily_charge,
        status,
      }
      let result
      if (existing?.id) {
        result = await api.put(`/collections/${existing.id}`, { status })
      } else {
        result = await api.post('/collections/', payload)
      }
      setCollections(prev => ({ ...prev, [vendor.id]: result.data }))
      toast.success(`${vendor.owner_name} → ${status}`)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(s => ({ ...s, [vendor.id]: false }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Date picker + summary */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="label">Collection Date</label>
          <input type="date" className="input w-auto" value={date} max={todayStr}
            onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex-1" />
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="text-green-600 dark:text-green-400 font-semibold">✅ Paid: {summary.paid}</span>
          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">⏳ Pending amt: ₹{summary.pending.toLocaleString('en-IN')}</span>
          <span className="text-red-500 font-semibold">❌ Not Paid: {summary.notPaid}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">💰 Collected: ₹{summary.collected.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {loading ? <Spinner /> : vendors.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No vendors found. Add vendors first.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Shop</th>
                  <th className="px-4 py-3 font-medium">Daily Charge</th>
                  <th className="px-4 py-3 font-medium">Current Status</th>
                  <th className="px-4 py-3 font-medium">Mark As</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {vendors.map((v, i) => {
                  const col = collections[v.id]
                  const isSaving = saving[v.id]
                  return (
                    <tr key={v.id} className={`${col ? statusColor[col.status] : ''} border-l-4 ${col ? '' : 'border-transparent'}`}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{v.owner_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{v.shop_name}</td>
                      <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-medium">₹{v.daily_charge}</td>
                      <td className="px-4 py-3">
                        {col ? <StatusBadge status={col.status} /> : <span className="text-gray-300 dark:text-gray-600 text-xs">Not recorded</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s}
                              disabled={isSaving || col?.status === s}
                              onClick={() => markStatus(v, s)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all
                                ${col?.status === s
                                  ? s === 'Paid' ? 'bg-green-500 text-white' : s === 'Pending' ? 'bg-yellow-400 text-white' : 'bg-red-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                disabled:opacity-60`}
                            >
                              {isSaving && col?.status !== s ? '…' : s}
                            </button>
                          ))}
                        </div>
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
