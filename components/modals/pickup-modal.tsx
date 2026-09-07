'use client'

import { useState } from 'react'

interface PickupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PickupModal({ open, onOpenChange }: PickupModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    items: '',
    weight: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Parse items from comma-separated string to array
      const itemsArray = formData.items.split(',').map(item => item.trim()).filter(Boolean)

      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledDate: formData.date,
          scheduledTime: formData.time,
          location: formData.location,
          items: itemsArray,
          weight: formData.weight,
          notes: formData.notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to schedule pickup')

      console.log('✅ Pickup scheduled:', data)
      setSuccess(true)

      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
        setFormData({ date: '', time: '', location: '', items: '', weight: '', notes: '' })
        window.location.reload() // Reload to show new pickup
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to schedule pickup')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Schedule a Pickup</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={formData.date}
              onChange={e => handleChange('date', e.target.value)}
              type="date"
              required
              className="border border-gray-300 rounded-xl px-3 py-2 w-full"
            />
            <input
              value={formData.time}
              onChange={e => handleChange('time', e.target.value)}
              type="time"
              required
              className="border border-gray-300 rounded-xl px-3 py-2 w-full"
            />
          </div>

          <input
            value={formData.location}
            onChange={e => handleChange('location', e.target.value)}
            placeholder="Pickup location"
            required
            className="border border-gray-300 rounded-xl px-3 py-2 w-full"
          />

          <input
            value={formData.items}
            onChange={e => handleChange('items', e.target.value)}
            placeholder="Items (comma separated)"
            required
            className="border border-gray-300 rounded-xl px-3 py-2 w-full"
          />

          <input
            value={formData.weight}
            onChange={e => handleChange('weight', e.target.value)}
            placeholder="Estimated weight (e.g., 2.5 kg)"
            required
            className="border border-gray-300 rounded-xl px-3 py-2 w-full"
          />

          <textarea
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Additional notes..."
            className="border border-gray-300 rounded-xl px-3 py-2 w-full"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">Pickup scheduled ✓</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded-xl text-white bg-green-600 hover:bg-green-700 transition"
          >
            {saving ? 'Scheduling...' : 'Schedule Pickup'}
          </button>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2 rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}
