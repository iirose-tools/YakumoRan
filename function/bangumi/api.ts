import got from 'got';

interface UserInfo {
  id: number
  url: string
  username: string
  nickname: string
  avatar: {
    large: string
    medium: string
    small: string
  },
  sign: string,
  usergroup: number
}

interface CollectionItem {
  "name": string
  "subject_id": number
  "ep_status": number
  "vol_status": number
  "lasttouch": number
  "subject": {
    "id": number
    "url": string
    "type": number
    "name": string
    "name_cn": string
    "summary": string
    "eps": number
    "eps_count": number
    "air_date": string
    "air_weekday": number
    "images": {
      "large": string
      "common": string
      "medium": string
      "small": string
      "grid": string
    },
    "collection": {
      "doing": number
    }
  }
}

export const user = {
  userInfo: async (username: string): Promise<UserInfo | null> => {
    try {
      const result = JSON.parse((await got(`https://api.bgm.tv/user/${username}`)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  },
  userCollection: async (username: string, cat: ('watching' | 'all_watching'), ids?: number[], responseGroup?: ('medium' | 'small')): Promise<CollectionItem[] | null> => {
    try {
      const url = `https://api.bgm.tv/user/${username}/collection?cat=${cat}&responseGroup=${responseGroup || ''}&ids=${ids ? ids.join(',') : ''}`;
      const result = JSON.parse((await got(url)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  },
  userCollectionsStatus: async (username: string) => {
    try {
      const result = JSON.parse((await got(`https://api.bgm.tv/user/${username}/collections/status?app_id=bgm1741600d4a496bed5`)).body);
      if(result.error) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  }
}