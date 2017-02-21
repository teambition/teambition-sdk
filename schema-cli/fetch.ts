import * as request from 'request'
import * as cheerio from 'cheerio'

export const fetch = (url) => {
  if (!/https?:\/\//.test(url)) {
    url = 'http://' + url
  }

  return new Promise<CheerioStatic>((resolve, reject) => {
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(cheerio.load(body))
      } else {
        reject(error)
      }
    })
  })
}
