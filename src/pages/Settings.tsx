import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'

type Props = {
  showBackLink?: boolean
}

export default function Settings({ showBackLink = true }: Props) {
  const { settings, saveSettings, resetSettings } = useSettings()
  const [warningDays, setWarningDays] = useState(settings.warningDays)
  const [doneColor, setDoneColor] = useState(settings.doneColor)
  const [warningColor, setWarningColor] = useState(settings.warningColor)
  const [overdueColor, setOverdueColor] = useState(settings.overdueColor)
  const [defaultColor, setDefaultColor] = useState(settings.defaultColor)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setWarningDays(settings.warningDays)
    setDoneColor(settings.doneColor)
    setWarningColor(settings.warningColor)
    setOverdueColor(settings.overdueColor)
    setDefaultColor(settings.defaultColor)
  }, [settings])

  const handleSave = () => {
    saveSettings({
      warningDays: Math.max(1, warningDays),
      doneColor,
      warningColor,
      overdueColor,
      defaultColor
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetSettings()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section>
      <h2>Settings</h2>
      <p className="muted">Configure action due date warnings and color codes.</p>

      <div style={{ maxWidth: 600, marginTop: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Warning Days Threshold
          </label>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 8 }}>
            Actions due within this many days will show a warning color.
          </p>
          <input
            type="number"
            min="1"
            max="30"
            value={warningDays}
            onChange={(e) => setWarningDays(parseInt(e.target.value) || 1)}
            style={{
              padding: '8px 12px',
              fontSize: '0.95rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              width: '100px'
            }}
          />
          <span style={{ marginLeft: 8, color: '#666' }}>days</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Done Color (Green)
          </label>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 8 }}>
            Color for completed actions.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="color"
              value={doneColor}
              onChange={(e) => setDoneColor(e.target.value)}
              style={{ width: 60, height: 40, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={doneColor}
              onChange={(e) => setDoneColor(e.target.value)}
              placeholder="#22c55e"
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '120px'
              }}
            />
            <div
              style={{
                width: 80,
                height: 40,
                backgroundColor: doneColor,
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Warning Color (Yellow)
          </label>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 8 }}>
            Color for actions due soon (within threshold).
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="color"
              value={warningColor}
              onChange={(e) => setWarningColor(e.target.value)}
              style={{ width: 60, height: 40, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={warningColor}
              onChange={(e) => setWarningColor(e.target.value)}
              placeholder="#f59e0b"
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '120px'
              }}
            />
            <div
              style={{
                width: 80,
                height: 40,
                backgroundColor: warningColor,
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Overdue Color (Red)
          </label>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 8 }}>
            Color for actions past their due date.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="color"
              value={overdueColor}
              onChange={(e) => setOverdueColor(e.target.value)}
              style={{ width: 60, height: 40, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={overdueColor}
              onChange={(e) => setOverdueColor(e.target.value)}
              placeholder="#ef4444"
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '120px'
              }}
            />
            <div
              style={{
                width: 80,
                height: 40,
                backgroundColor: overdueColor,
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Default Color (Gray)
          </label>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 8 }}>
            Color for actions without a due date.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="color"
              value={defaultColor}
              onChange={(e) => setDefaultColor(e.target.value)}
              style={{ width: 60, height: 40, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={defaultColor}
              onChange={(e) => setDefaultColor(e.target.value)}
              placeholder="#e5e7eb"
              style={{
                padding: '8px 12px',
                fontSize: '0.9rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                width: '120px'
              }}
            />
            <div
              style={{
                width: 80,
                height: 40,
                backgroundColor: defaultColor,
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button className="btn" onClick={handleSave}>
            Save Settings
          </button>
          <button className="btn secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          {saved && (
            <span style={{ color: '#22c55e', marginLeft: 8, alignSelf: 'center' }}>
              ✓ Saved!
            </span>
          )}
        </div>
      </div>

      {showBackLink && (
        <p style={{ marginTop: 32 }}>
          <Link to="/action">← Back to Actions</Link>
        </p>
      )}
    </section>
  )
}
