import type { NextApiRequest, NextApiResponse } from 'next'
import { UG_TABS_URL } from '../../constants'

export default async function handlerTranspose(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const queryChords = req.query as Record<string, string>
  const queryTransposeUG = new URLSearchParams(queryChords)
  if (queryChords) {
    queryTransposeUG.set('appl_api_version', '2')
    queryTransposeUG.set('custom', '0')
    queryTransposeUG.set('instr', 'guitar')
    queryTransposeUG.set('json', '1')
    queryTransposeUG.set('tuning', 'E A D G B E')

    const transposedChords = await fetch(
      `
        ${UG_TABS_URL}/tab/applicature/transpose?${queryTransposeUG.toString()}`,
      {
        headers: {
          Referer: UG_TABS_URL,
          Accept: 'application/json',
        },
      },
    )
    try {
      const resultTransposedChords = await transposedChords.json()
      if (Object.keys(resultTransposedChords?.info?.applicature).length > 0) {
        let objStructModified = {}
        Object.keys(resultTransposedChords.info.applicature).forEach((key) => {
          objStructModified[key] = Object.values(
            resultTransposedChords.info.applicature[key],
          )
        })
        res.status(200).json(objStructModified)
      } else {
        res.status(200).json([])
      }
    } catch (e) {
      console.log(e)
      res.status(200).json([])
    }
  } else {
    res.status(200).json([])
  }
}
