import got from 'got'

export const create = async (text: string, poster: string, lang: string) => {
  const resp = await got.post('https://pastebin.ubuntu.com/', {
    followRedirect: false,
    form: {
      poster: poster,
      syntax: lang,
      expiration: 'week',
      content: text
    }
  })
  const url = resp.headers.location
  if (url) {
    if (url.includes('http')) return url
    return `https://pastebin.ubuntu.com${url}`
  }
  return null
}
