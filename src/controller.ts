import dayjs from 'dayjs';
import { joi, Use, Context, createParamDecorator, Controller, Description, Get, QuerySchame, Ctx, Query, Post, Body, BodySchame } from 'koast';
import * as eastmoneyService from './eastmoney.service'

@Controller('/')
export default class Test {
  @Get('/gasoline')
  @QuerySchame({
    year: joi.string().required(),
    province: joi.string(),
  })
  async gasoline(@Ctx() ctx: Context, @Query() query: any) {
    let data = []
    for (let index = 0; index < (query.year || 1); index++) {
      const year = dayjs().subtract(index, 'year').format('YYYY')
      const d = await eastmoneyService.getYearData(year)
      data = data.concat(d)
    }
    data = data.reverse().filter(v => query.province ? v.province === query.province : true)
    return { code: 0, message: 'success', data };
  }
}
