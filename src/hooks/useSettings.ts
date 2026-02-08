import { useState, useEffect } from 'react'

export type ActionSettings = {
  warningDays: number
  doneColor: string
  warningColor: string
  overdueColor: string
  defaultColor: string
}

const DEFAULT_SETTINGS: ActionSettings = {
  warningDays: 3,
  doneColor: '#22c55e',
  warningColor: '#f59e0b',
  overdueColor: '#ef4444',
  defaultColor: '#e5e7eb'
}

const SETTINGS_KEY = 'actionSettings'

export function useSettings() {
  const [settings, setSettings] = useState<ActionSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error('Failed to load settings', e)
    }
    return DEFAULT_SETTINGS
  })

  const saveSettings = (newSettings: ActionSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (e) {
      console.error('Failed to save settings', e)
    }
  }

  const resetSettings = () => {
    try {
      localStorage.removeItem(SETTINGS_KEY)
      setSettings(DEFAULT_SETTINGS)
    } catch (e) {
      console.error('Failed to reset settings', e)
    }
  }

  return { settings, saveSettings, resetSettings }
}
