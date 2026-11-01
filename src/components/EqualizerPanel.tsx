import { memo, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

import { useI18n } from '@/lang'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { initAudioEffect, getAudioEffectInfo } from '@/plugins/player/audiofx'
import { useTheme } from '@/store/theme/hook'
import CheckBoxItem from '@/screens/Home/Views/Setting/components/CheckBoxItem'
import SubTitle from '@/screens/Home/Views/Setting/components/SubTitle'
import Slider from '@/screens/Home/Views/Setting/components/Slider'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'


const presetNameMap: Record<string, string> = {
  Normal: '标准',
  Classical: '古典',
  Dance: '舞曲',
  Flat: '平直',
  Folk: '民谣',
  'Heavy Metal': '重金属',
  'Hip Hop': '嘻哈',
  Jazz: '爵士',
  Pop: '流行',
  Rock: '摇滚',
}

// 注意：Android Equalizer.getCenterFreq() 返回的是毫赫兹(mHz)
const formatFreq = (mhz: number) => {
  const hz = mhz / 1000
  return hz >= 1000 ? `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)}k` : `${Math.round(hz)}`
}

const EqualizerPanel = () => {
  const t = useI18n()
  const theme = useTheme()

  const enable = useSettingValue('player.equalizer.enable')
  const preset = useSettingValue('player.equalizer.preset')
  const bands = useSettingValue('player.equalizer.bands')

  const [info, setInfo] = useState<{ bandInfo: { numBands: number, minLevel: number, maxLevel: number, centerFreqs: number[] } | null, presets: string[] }>({ bandInfo: null, presets: [] })
  const [localBands, setLocalBands] = useState<number[]>([])

  useEffect(() => {
    let active = true
    void initAudioEffect().then(() => {
      if (!active) return
      const i = getAudioEffectInfo()
      setInfo(i)
      if (i.bandInfo) {
        const base = bands.length === i.bandInfo.numBands
          ? bands
          : new Array(i.bandInfo.numBands).fill(0)
        setLocalBands(base)
      }
    })
    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEnable = (value: boolean) => {
    updateSetting({ 'player.equalizer.enable': value })
  }

  const handlePreset = (index: number) => {
    updateSetting({ 'player.equalizer.preset': index })
  }

  const handleCustom = () => {
    updateSetting({ 'player.equalizer.preset': -1 })
  }

  const handleBandChange = (index: number, value: number) => {
    if (preset !== -1) updateSetting({ 'player.equalizer.preset': -1 })
    const newBands = [...localBands]
    newBands[index] = value
    setLocalBands(newBands)
  }

  const handleBandComplete = (index: number, value: number) => {
    const newBands = [...localBands]
    newBands[index] = value
    setLocalBands(newBands)
    updateSetting({ 'player.equalizer.bands': newBands })
  }

  return (
    <View>
      <CheckBoxItem check={enable} onChange={handleEnable} label={t('setting_equalizer_enable')} />

      {enable && info.bandInfo && (
        <>
          <SubTitle title={t('setting_equalizer_preset')}>
            <View style={styles.presetWrap}>
              {info.presets.map((name, i) => (
                <Pressable
                  key={i}
                  style={[styles.chip, preset === i && styles.chipActive]}
                  onPress={() => { handlePreset(i) }}
                >
                  <Text style={[styles.chipText, preset === i && { color: theme['c-primary'] }]}>
                    {presetNameMap[name] ?? name}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.chip, preset === -1 && styles.chipActive]}
                onPress={handleCustom}
              >
                <Text style={[styles.chipText, preset === -1 && { color: theme['c-primary'] }]}>
                  {t('setting_equalizer_custom')}
                </Text>
              </Pressable>
            </View>
          </SubTitle>

          {preset === -1 && (
            <View style={styles.bands}>
              {info.bandInfo.centerFreqs.map((freq, i) => (
                <View key={i} style={styles.bandRow}>
                  <Text style={styles.bandLabel}>{formatFreq(freq)}</Text>
                  <Slider
                    value={localBands[i] ?? 0}
                    minimumValue={info.bandInfo?.minLevel ?? 0}
                    maximumValue={info.bandInfo?.maxLevel ?? 0}
                    step={100}
                    onValueChange={(v: number) => { handleBandChange(i, v) }}
                    onSlidingComplete={(v: number) => { handleBandComplete(i, v) }}
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {enable && !info.bandInfo && (
        <Text style={styles.tip}>{t('setting_equalizer_loading')}</Text>
      )}
    </View>
  )
}

const styles = createStyle({
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 25,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.35)',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    borderColor: '#9b7bff',
    backgroundColor: 'rgba(125, 95, 255, 0.18)',
  },
  chipText: {
    fontSize: 13,
  },
  bands: {
    paddingLeft: 25,
    marginTop: 6,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bandLabel: {
    width: 44,
    fontSize: 12,
    opacity: 0.7,
  },
  tip: {
    paddingLeft: 25,
    marginTop: 6,
    opacity: 0.6,
    fontSize: 13,
  },
})

export default memo(EqualizerPanel)
