import axios from 'axios'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'

export async function getYearData(y: string) {
  const f = path.join(__dirname, '..', 'data', y + '.txt')
  if (!fs.existsSync(f)) {
    return []
  }
  return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

export async function crawlDayData(day: string) {
  const f = path.join(__dirname, '..', 'data', dayjs(day).format('YYYY') + '.txt')
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, JSON.stringify([]));
  }
  const res = await getGasolinePrice(day)
  if (res.code !== 0) {
    console.error(res.message)
    return
  }
  if (!res.result?.data.length) {
    console.error('日期' + day + '无油价信息')
    return
  }
  const dayData = (res.result?.data as any[])?.map(v => {
    return {
      day: dayjs(v.DIM_DATE).format('YYYY-MM-DD'),
      province: v.CITYNAME,
      v89: v.V89, // 89#汽油	92#汽油	95#汽油	0#柴油
      v92: v.V92,
      v95: v.V95,
      v0: v.V0
    }
  }) || []
  let yearData: any[] = [];
  try {
    yearData = JSON.parse(fs.readFileSync(f, 'utf-8'));
    if (!Array.isArray(yearData)) {
      yearData = []
    }
  } catch (error) {
    console.error(error.message)
  }
  const data = yearData.filter(v => v.day !== day).concat(dayData)
  fs.writeFileSync(f, JSON.stringify(data));
  return true
}

const headers = {
  'Accept': '*/*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Pragma': 'no-cache',
  'Referer': 'https://data.eastmoney.com/',
  'Sec-Fetch-Dest': 'script',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
  'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"'
}

export async function getDays() {
  const config = {
    method: 'get',
    url: 'https://datacenter-web.eastmoney.com/api/data/v1/get',
    params: {
      callback: '',
      reportName: 'RPTA_WEB_YJ_RQ',
      columns: 'ALL',
      sortColumns: 'DIM_DATE',
      sortTypes: -1,
      pageNumber: 1,
      pageSize: 5000,
      source: 'WEB',
      _: Date.now()
    },
    headers
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getGasolinePrice(day: string) {
  const config = {
    method: 'get',
    url: 'https://datacenter-web.eastmoney.com/api/data/v1/get',
    params: {
      callback: '',
      reportName: 'RPTA_WEB_YJ_JH',
      columns: 'ALL',
      filter: `(DIM_DATE='${day}')`, // 2022-06-15
      sortColumns: 'FIRST_LETTER',
      sortTypes: 1,
      pageNumber: 1,
      pageSize: 100,
      source: 'WEB',
      _: Date.now()
    },
    headers
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}