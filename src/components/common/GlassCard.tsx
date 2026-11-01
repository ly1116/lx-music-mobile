import { View, type ViewProps } from 'react-native'

import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'


const styles = createStyle({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
})

export interface GlassCardProps extends ViewProps {
  radius?: number
}

/**
 * 玻璃拟态卡片：半透明主题色背景 + 主题色描边 + 圆角。
 * 用于播放条、弹窗、卡片等需要"时尚通透"质感的场景。
 */
export default ({ style, radius = 16, children, ...rest }: GlassCardProps) => {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius,
          backgroundColor: theme['c-primary-alpha-700'] ?? 'rgba(255, 255, 255, 0.12)',
          borderColor: theme['c-primary-alpha-400'] ?? 'rgba(255, 255, 255, 0.18)',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}
