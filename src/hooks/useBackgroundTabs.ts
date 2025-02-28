import { useQuery } from 'react-query'
import { Tab } from '../types/tabs'
import { getTabData } from './useTabs'

export default function useBackgroundTabs(
  url: string,
  fontSize: number = 100,
  widthBrowser: number,
  favourites: Tab[],
) {
  return useQuery(
    ['getBackgroundTab', fontSize, widthBrowser],
    async ({ signal }) => getTabData(url, fontSize, widthBrowser, signal, favourites),
    {
      enabled: url.length > 0,
      cacheTime: 0,
    },
  )
}
