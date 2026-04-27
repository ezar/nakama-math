import { translations } from './translations'
import { useSettingsStore } from '../store/settingsStore'

export function useTranslation() {
  const locale = useSettingsStore(s => s.locale)
  return translations[locale]
}
