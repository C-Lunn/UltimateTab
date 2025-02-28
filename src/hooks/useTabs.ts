import { useQuery } from 'react-query'
import { ApiResponseTab, Tab } from '../types/tabs'
export const getTabData = async (
  url: string,
  fontSize: number,
  widthBrowser: number,
  signal: AbortSignal,
  favourites: Tab[],
): Promise<Tab> => {
  const found_tab = favourites.find((tab) => tab.url === url)
  if (found_tab) {
    return found_tab
  }
  const response = await fetch(
    `/api/tab?q=${url}&width=${Math.ceil(
      widthBrowser * (1 - (fontSize - 100) / 100),
    )}&height=${Math.ceil(
      document.documentElement.clientHeight * (1 - (fontSize - 100) / 100),
    )}`,
    { signal },
  )
  const parsedResponse: ApiResponseTab = await response.json()
  return parsedResponse.tab
}
export default function useTabs(
  url: string,
  fontSize: number = 100,
  widthBrowser: number,
  favourites: Tab[],
) {
  return useQuery(
    ['getTab', url],
    async ({ signal }) => getTabData(url, fontSize, widthBrowser, signal, favourites),
    {
      enabled: url.length > 0,
    },
  )
}
