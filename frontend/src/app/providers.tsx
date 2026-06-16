import type { ReactNode } from 'react'
import { ConfigProvider, AdaptivityProvider, AppRoot } from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider colorScheme="light">
      <AdaptivityProvider>
        <AppRoot>{children}</AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
