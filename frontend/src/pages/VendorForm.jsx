// pages/VendorForm.jsx – Add or Edit a vendor
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

export default function VendorForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    owner_name: '', shop_name: '', phone_number: '', daily_charge: ''
  })

  useEffect(() => {
    if (!isEdit) return
    api.get(`/vendors/${id}`)
      .then(r => setForm({
        owner_name: r.data.owner_name,
        shop_name: r.data.shop_name,
        phone_number: r.data.phone_number || '',
        daily_charge: String(r.data.daily_charge),
      }))
      .catch(() => { toast.error('Vendor not found'); navigate('/vendors') })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, daily_charge: parseFloat(form.daily_charge) }
      if (isEdit) {
        await api.put(`/vendors/${id}`, payload)
        toast.success('Vendor updated')
      } else {
        await api.post('/vendors/', payload)
        toast.success('Vendor added')
      }
      navigate('/vendors')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {isEdit ? '✏️ Edit Vendor' : '➕ Add New Vendor'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Owner Name *</label>
            <input className="input" placeholder="e.g. Ramesh Kumar" required
              value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Shop Name *</label>
            <input className="input" placeholder="e.g. Ramesh Sabji Wala" required
              value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" placeholder="e.g. 9876543210" type="tel"
              value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
          </div>
          <div>
            <label className="label">Daily Charge (₹) *</label>
            <input className="input" placeholder="e.g. 50" type="number" min="0" step="0.5" required
              value={form.daily_charge} onChange={e => setForm({ ...form, daily_charge: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/vendors')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : isEdit ? 'Update Vendor' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
