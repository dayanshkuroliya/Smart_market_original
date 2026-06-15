// components/Spinner.jsx
export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${s} border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        style={{ borderWidth: 3 }} />
    </div>
  )
}
