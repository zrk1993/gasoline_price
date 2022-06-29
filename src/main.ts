import { Koast } from 'koast';
import serve from 'koa-static';
import routers from './controller';
import path from 'path'

async function main() {
  const app = new Koast();

  app.use(serve(path.join(__dirname, '..', 'public')));

  // app.useSwagger([routers])
  // console.log('swagger address http://localhost:3000/swagger-ui/index.html')

  app.useRouter([routers]);
  app.listen(3000, () => {
    console.log('server start on http://localhost:3000')
  });
}

main()

