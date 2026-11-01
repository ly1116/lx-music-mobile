import { NativeModules } from 'react-native'

const { AudioFxModule } = NativeModules

export interface EqBandInfo {
  numBands: number
  minLevel: number
  maxLevel: number
  centerFreqs: number[]
}

export interface EqInitResult {
  bandInfo: EqBandInfo
  presets: string[]
}

export const isAudioFxAvailable = !!AudioFxModule

export const initAudioFxModule = async(): Promise<EqInitResult> => {
  return AudioFxModule.init()
}
export const setEqEnabled = async(enabled: boolean): Promise<void> => {
  return AudioFxModule.setEnabled(enabled)
}
export const applyEqPreset = async(preset: number): Promise<void> => {
  return AudioFxModule.applyPreset(preset)
}
export const setEqBandLevel = async(band: number, level: number): Promise<void> => {
  return AudioFxModule.setBandLevel(band, level)
}
export const releaseAudioFxModule = async(): Promise<void> => {
  return AudioFxModule.release()
}
