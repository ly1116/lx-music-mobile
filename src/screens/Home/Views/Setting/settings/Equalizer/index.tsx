import { memo } from 'react'

import Section from '../../components/Section'
import { useI18n } from '@/lang'
import EqualizerPanel from '@/components/EqualizerPanel'


export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_equalizer')}>
      <EqualizerPanel />
    </Section>
  )
})
