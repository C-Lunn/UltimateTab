import type { NextApiRequest, NextApiResponse } from 'next'
import type { ApiRequestTab, ApiResponseTab } from '../../types/tabs'
import { PuppeteerTabGetter, FetchTabGetter } from '../../lib/core/tab'
import { USE_PUPPETEER, UG_BASE_URL } from '../../constants'

export default async function handlerTab(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let formattedReq: ApiRequestTab = {
    url: req.query.q as string,
    width: req.query.width as string,
    height: req.query.height as string,
  }
  if (formattedReq.url) {
    let tabs: ApiResponseTab;
    if (USE_PUPPETEER) {
      tabs = await new PuppeteerTabGetter().getTab(formattedReq.url, formattedReq.width, formattedReq.height)
    }
    else {
      tabs = await new FetchTabGetter(UG_BASE_URL).getTab(formattedReq.url, formattedReq.width, formattedReq.height)
    }
    if (tabs) {
      res.status(200).json(tabs)
    } else {
      res.status(500).json({ error: 'failed to load data' })
    }
  } else {
    res.status(500).json({ error: '"q" parameter is missing' })
  }
}
