// components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  if (status === 'Paid')     return <span className="badge-paid">✓ Paid</span>
  if (status === 'Pending')  return <span className="badge-pending">⏳ Pending</span>
  if (status === 'Not Paid') return <span className="badge-notpaid">✗ Not Paid</span>
  return null
}
