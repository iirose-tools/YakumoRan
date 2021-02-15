import got from 'got';

interface Items {
  itemId: string,
  name: string,
  description: string,
  rarity: number,
  iconId: string,
  overrideBkg: any,
  stackIconId: string,
  sortId: number,
  usage: string,
  obtainApproach: any,
  classifyType: string,
  itemType: string,
  stageDropList: {
    stageId: string,
    occPer: string
  }[],
  buildingProductList: {
    roomType: string,
    formulaId: number
  }[]
}

export const getData = async (): Promise<Items[] | null> => {
  try {
    const result = await got('https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData@latest/zh_CN/gamedata/excel/item_table.json')
    const data = JSON.parse(result.body);
    const items: Items[] = []

    Object.values(data.items).forEach((e: any) => {
      items.push(e);
    });

    return items;
  } catch (error) {
    return null;
  }
}

export const getItem = async (name: string): Promise<Items[] | null> => {
  const items = await getData();
  if(items) {
    let item: Items[] = [];
    items.forEach(e => {
      if(e.name.indexOf(name) !== -1) {
        item.push(e)
      }
    });
    return item;
  } else {
    return null;
  }
}

export const request = async (path: string) => {
  try {
    const result = await got(`https://penguin-stats.cn/PenguinStats${path}`);
    
    if(result.statusCode === 200) return JSON.parse(result.body);
    return null;
  }catch(e) {
    return null;
  }
}

export const getStagesByID = async (id: string) => {
  const path = `/api/v2/stages/${id}`;
  const result = await request(path);
  if(result) {
    if(result.code == 404) return null;

    return result;
  }

  return null;
}

export const GetMatrix = async (item: string) => {
  const path = `/api/v2/result/matrix?itemFilter=${item}&server=CN`;
  const result = await request(path);
  if(result) return result.matrix;
  return null;
}