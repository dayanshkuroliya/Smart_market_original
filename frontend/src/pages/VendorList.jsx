// pages/VendorList.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

export default function VendorList() {
  const [vendors, setVendors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchVendors = (q = '') => {
    setLoading(true)
    api.get('/vendors/', { params: q ? { search: q } : {} })
      .then(r => setVendors(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVendors() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchVendors(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete vendor "${name}"? All collection history will also be deleted.`)) return
    setDeleting(id)
    try {
      await api.delete(`/vendors/${id}`)
      toast.success(`${name} deleted`)
      setVendors(v => v.filter(x => x.id !== id))
    } catch {
      toast.error('Failed to delete vendor')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            className="input pl-9"
            placeholder="Search by owner or shop name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Link to="/vendors/add" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <span>+</span> Add Vendor
        </Link>
      </div>

      {loading ? <Spinner /> : vendors.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-gray-500 dark:text-gray-400">No vendors found</p>
          <Link to="/vendors/add" className="btn-primary mt-4 inline-block">Add first vendor</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Owner Name</th>
                  <th className="px-4 py-3 font-medium">Shop Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Daily Charge</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {vendors.map((v, i) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{v.owner_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{v.shop_name}</td>
                    <td className="px-4 py-3 text-gray-500">{v.phone_number || '—'}</td>
                    <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">₹{v.daily_charge}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/vendors/edit/${v.id}`)}
                          className="text-xs btn-secondary px-3 py-1"
                        >✏️ Edit</button>
                        <button
                          onClick={() => navigate(`/history?vendor=${v.id}`)}
                          className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-medium"
                        >📋 History</button>
                        <button
                          disabled={deleting === v.id}
                          onClick={() => handleDelete(v.id, v.owner_name)}
                          className="text-xs btn-danger px-3 py-1"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50 dark:border-gray-700">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
