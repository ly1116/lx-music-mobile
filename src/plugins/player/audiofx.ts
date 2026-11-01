import settingState from '@/store/setting/state'
import {
  initAudioFxModule,
  setEqEnabled,
  applyEqPreset,
  setEqBandLevel,
  isAudioFxAvailable,
  type EqBandInfo,
  type EqInitResult,
} from '@/utils/nativeModules/audioFx'


let isInit = false
let listenersRegistered = false
let bandInfo: EqBandInfo | null = null
let presets: string[] = []

export const getEqBandInfo = () => bandInfo
export const getEqPresets = () => presets
export const getAudioEffectInfo = () => ({ bandInfo, presets })

const applySetting = async() => {
  if (!isAudioFxAvailable || !isInit) return
  const setting = settingState.setting
  const enable = setting['player.equalizer.enable']
  const preset = setting['player.equalizer.preset']
  const bands = setting['player.equalizer.bands']
  try {
    await setEqEnabled(enable)
    if (enable && preset >= 0 && presets.length > 0) {
      await applyEqPreset(preset)
    } else if (enable && bandInfo) {
      for (let i = 0; i < bandInfo.numBands; i++) {
        await setEqBandLevel(i, bands[i] ?? 0)
      }
    }
  } catch (err) {
    console.error('apply equalizer setting failed', err)
  }
}

const handleConfigUpdated = (keys: Array<keyof LX.AppSetting>) => {
  if (keys.some(k => String(k).startsWith('player.equalizer'))) {
    void applySetting()
  }
}

const ensureListener = () => {
  if (listenersRegistered) return
  listenersRegistered = true
  global.state_event.on('configUpdated', handleConfigUpdated)
}

/**
 * 初始化全局音效（Equalizer）。幂等，可重复调用。
 * 会在首次调用时向 configUpdated 事件注册监听，设置变更后自动应用。
 */
export const initAudioEffect = async(): Promise<void> => {
  if (!isAudioFxAvailable) return
  ensureListener()
  if (isInit) return
  try {
    const result: EqInitResult = await initAudioFxModule()
    bandInfo = result.bandInfo
    presets = result.presets
    // eslint-disable-next-line require-atomic-updates
    isInit = true
    await applySetting()
  } catch (err) {
    console.error('init audio effect failed', err)
  }
}

export const releaseAudioEffect = async(): Promise<void> => {
  if (!isAudioFxAvailable) return
  try {
    const { releaseAudioFxModule } = await import('@/utils/nativeModules/audioFx')
    await releaseAudioFxModule()
  } catch (err) {
    console.error('release audio effect failed', err)
  }
  isInit = false
  bandInfo = null
  presets = []
}
