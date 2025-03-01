import { getSpotifyAccessToken } from './../api/spotify'
import {
  Tab,
  Pagination,
  ApiResponseTab,
  Tabscraped,
  UGChordCollection,
  ApiArgsSearch,
} from './../../types/tabs'
import { TAB_TYPES_VALUES } from '../../constants'
import { ApiResponseSearch } from '../../types/tabs'
import { encodeParams, getPuppeteerConf } from '../api/request'
import sanitizeHtml from 'sanitize-html'
import * as htmlparser2 from "htmlparser2";
import * as nhp from "node-html-parser";
import { ParseUGTab, TabSheet } from './TabSheet'

export function validateType(type: string): string {
  if (type in TAB_TYPES_VALUES) {
    return TAB_TYPES_VALUES[type]
  } else {
    throw new Error(
      `Unknown type '${type}'. Accepted types are: '${Object.keys(
        TAB_TYPES_VALUES,
      ).join("', '")}'`,
    )
  }
}

export interface TabGetter {
  getTabsList: (url: string, args: ApiArgsSearch) => Promise<ApiResponseSearch>
  getTab: (url: string, width?: string, height?: string) => Promise<ApiResponseTab>
}

export class PuppeteerTabGetter implements TabGetter {
  constructor() { }
  async getTabsList(url: string, args: ApiArgsSearch): Promise<ApiResponseSearch> {
    const { page, browser } = await getPuppeteerConf()
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      // wait for selector if Cloudflare bot detection page need to be bypass first
      await page.waitForSelector('.js-page', { timeout: 10000 })
      const source = args.source
      const q = args.q
      const tabsParsed: ApiResponseSearch = await page.evaluate(
        ({ source, q }) => {
          const data = window.UGAPP.store.page.data
          let results: Tabscraped[] = [
            ...(data?.other_tabs || []),
            ...(data?.results || []),
          ]

          const pagination: Pagination = {
            current: data.pagination.current,
            total: data.pagination.total,
          }
          const tabs: Tab[] = results
            .filter((result) => {
              const isTypeExcluded =
                !result.marketing_type &&
                !['Pro', 'Power', 'Official', 'Drums', 'Video'].includes(
                  result.type,
                )

              if (source === 'artist_name') {
                return (
                  isTypeExcluded &&
                  result.artist_name &&
                  result.artist_name.toLowerCase().includes(q.toLowerCase())
                )
              } else if (source === 'song_name') {
                return (
                  isTypeExcluded &&
                  result.song_name &&
                  result.song_name.toLowerCase().includes(q.toLowerCase())
                )
              } else {
                return isTypeExcluded
              }
            })
            .map((result) => ({
              artist: result.artist_name,
              name: result.song_name,
              url: result.tab_url,
              // Manage URL formatted like '/tab/[ID]'
              slug:
                result.tab_url.split('/').length === 5
                  ? result.tab_url.split('/').splice(-1).join('/')
                  : result.tab_url.split('/').splice(-2).join('/'),
              rating: parseFloat(result.rating.toFixed(2)),
              numberRates: result.votes,
              type:
                result.type === 'Ukulele Chords'
                  ? 'Ukulele'
                  : result.type === 'Bass Tabs'
                    ? 'Bass'
                    : result.type,
            }))

          const response: ApiResponseSearch = { results: tabs, pagination }
          return response
        },
        { source, q },
      )
      await browser.close()
      return tabsParsed
    } catch (error) {
      console.log(error)
    } finally {
      await browser.close()
    }
  }

  async getTab(url: string, width?: string, height?: string): Promise<ApiResponseTab> {
    const getTabinfo = async () => {
      const { page, browser } = await getPuppeteerConf({
        widthBrowser: width,
        heightBrowser: height,
      })
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        // wait for selector if Cloudflare bot detection page need to be bypass first
        await page.waitForSelector('.js-page', { timeout: 10000 })
        const tabParsed: Tab = await page.evaluate(() => {
          return get_tab_from_jsstore(window.UGAPP).tabInfo;
        })
        // await browser.close()
        return { tabInfos: tabParsed, browser: browser }
      } catch (error) {
        console.log(error)
        await browser.close()
      }
    }

    const getResponsiveTab = async () => {
      const { page, browser } = await getPuppeteerConf({
        widthBrowser: width,
        heightBrowser: height,
      })
      try {
        //scraping as a mobile to get responsive tab content
        //We cannot scrap everything directly as a mobile because a lot of infos are missing in mobile view in the window UGAPP variable (versions,votes,etc...)
        //Replacing Linux word in userAgent because there's an issue with UG when having a Linux userAgent, returning an error page
        await page.setUserAgent(
          (await browser.userAgent()).replace('Linux', 'Windows') +
          ' Mobile Safari iPhone',
        )
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        // wait for selector if Cloudflare bot detection page need to be bypass first
        await page.waitForSelector('.js-page', { timeout: 10000 })

        const tabResponsive: string = await page.evaluate(() => {
          return document.querySelector('pre')?.outerHTML || ''
        })
        // await browser.close()
        return {
          htmlTab: sanitizeHtml(tabResponsive, {
            allowedAttributes: {
              span: ['class'],
            },
          }),
          browser: browser,
        }
      } catch (error) {
        await browser.close()
        console.log(error)
      }
    }
    const [tabParsed, tabResponsive] = await Promise.all([
      getTabinfo(),
      getResponsiveTab(),
    ])

    // Close browsers when both requests completed to prevent an issue with "puppeteer-real-browser" on Linux
    await tabParsed.browser.close()
    await tabResponsive.browser.close()

    tabParsed.tabInfos.htmlTab = tabResponsive?.htmlTab
    const { access_token } = await getSpotifyAccessToken()
    return { tab: tabParsed.tabInfos, spotify_access_token: access_token }
  }

}

export class FetchTabGetter implements TabGetter {
  readonly base_url: string
  constructor(base_url: string) {
    this.base_url = base_url;
  }
  async getTabsList(
    _: string,
    args: ApiArgsSearch,
  ): Promise<ApiResponseSearch> {
    const resultsPage = await fetch(`${this.base_url}/search.php?` + encodeParams(args));
    const bod = await resultsPage.text();
    // parse html
    const doc = htmlparser2.parseDocument(bod);
    // get js-store and un-html
    const jsStore = htmlparser2.DomUtils.findOne((elem) => elem.attribs.class === 'js-store', doc.children);
    const data: any = JSON.parse(jsStore.attribs["data-content"])["store"]["page"]["data"]
    const jss: Tabscraped[] = data["results"];
    const ret: ApiResponseSearch = {
      results: [],
      pagination: {
        current: data.pagination.current,
        total: data.pagination.total,
      }
    };
    for (const res of jss) {
      try {
        if (!["Ukulele Chords", "Bass Tabs", "Chords", "Tabs"].includes(res.type)) continue;
        ret.results.push({
          artist: res["artist_name"],
          name: res["song_name"],
          url: res["tab_url"],
          slug:
            res.tab_url.split('/').length === 5
              ? res.tab_url.split('/').splice(-1).join('/')
              : res.tab_url.split('/').splice(-2).join('/'),
          rating: parseFloat(res.rating.toFixed(2)),
          numberRates: res.votes,
          type:
            res.type === 'Ukulele Chords'
              ? 'Ukulele'
              : res.type === 'Bass Tabs'
                ? 'Bass'
                : res.type,
        } as Tab);
      } catch (e) {
        continue;
      }

    }
    return ret;
  }



  async getTab(
    url: string,
    width?: string,
    height?: string,
  ): Promise<ApiResponseTab> {
    const getTabinfo = async () => {
      try {
        const pg = await fetch(url);
        // wait for selector if Cloudflare bot detection page need to be bypass first
        const bod = await pg.text();
        // parse html
        const doc = htmlparser2.parseDocument(bod);
        // get js-store and un-html
        const jsStore = htmlparser2.DomUtils.findOne((elem) => elem.attribs.class === 'js-store', doc.children);
        return get_tab_from_jsstore(jsStore);
      } catch (error) {
        console.log(error)
      }
    }

    const getResponsiveTab = async () => {
      try {
        //scraping as a mobile to get responsive tab content
        //We cannot scrap everything directly as a mobile because a lot of infos are missing in mobile view in the window UGAPP variable (versions,votes,etc...)
        //Replacing Linux word in userAgent because there's an issue with UG when having a Linux userAgent, returning an error page
        const page = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1',
          }
        })
        const bod = await page.text();
        // get js-store and un-html
        const doc = nhp.parse(bod);
        const pre = doc.querySelector('pre').outerHTML;

        return {
          htmlTab: sanitizeHtml(pre, {
            allowedAttributes: {
              span: ['class'],
            },
          }),
        }
      } catch (error) {
        console.log(error)
      }
    }
    const [tabParsed, tabResponsive] = await Promise.all([
      getTabinfo(),
      getResponsiveTab(),
    ])


    tabParsed.tabInfo["htmlTab"] = tabResponsive?.htmlTab
    const { access_token } = await getSpotifyAccessToken()
    return { tab: tabParsed.tabInfo, spotify_access_token: access_token }
  }
}

function get_tab_from_jsstore(jsStore: any) {
  const data: any = JSON.parse(jsStore.attribs["data-content"])["store"]["page"]["data"]
  const { tab_view } = data
  const {
    tab_url,
    artist_name,
    song_name,
    rating,
    votes,
    type,
  }: Tabscraped = data.tab
  const tuning: string[] = tab_view?.meta?.tuning?.value?.split(' ') || [
    'E',
    'A',
    'D',
    'G',
    'B',
    'E',
  ]
  const difficulty: string = tab_view?.ug_difficulty || 'unknown'
  const tonality: string = tab_view?.meta?.tonality || 'unknown'
  const capo: string = tab_view?.meta?.capo || 'no capo'
  const raw_tabs: string = tab_view?.wiki_tab?.content || ''
  const chordsDiagrams: UGChordCollection[] = tab_view?.applicature || []
  const versions: Tabscraped[] =
    tab_view?.versions.filter(
      (tab: Tabscraped) => tab.type !== 'Official',
    ) || []
  const sheet: TabSheet = ParseUGTab(raw_tabs);
  let versionsFormatted: Tab[] = versions.map((tabscraped) => {
    return {
      artist: tabscraped.artist_name,
      name: tabscraped.song_name,
      url: tabscraped.tab_url,
      difficulty: tabscraped.difficulty,
      numberRates: tabscraped.votes,
      type: tabscraped.type,
      slug: tabscraped.tab_url.split('/').splice(-2).join('/'),
      rating: parseFloat(tabscraped.rating.toFixed(2)),
    }
  })

  if (Array.isArray(versionsFormatted)) {
    versionsFormatted = versionsFormatted.sort(function (elem1, elem2) {
      return (
        elem2.rating * elem2.numberRates -
        elem1.rating * elem1.numberRates
      )
    })
  }

  const tabParsed = {
    artist: artist_name,
    name: song_name,
    url: tab_url,
    difficulty,
    tuning,
    tonality,
    capo,
    raw_tabs,
    numberRates: votes,
    type: type,
    slug: tab_url.split('/').splice(-2).join('/'),
    rating: parseFloat(rating.toFixed(2)),
    versions: versionsFormatted,
    chordsDiagrams,
    sheet
  }
  return { tabInfo: tabParsed }
} 
