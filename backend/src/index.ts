import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'


const app = new Hono<{
  Bindings: {
    [x: string]: string
    DATABASE_URL: string
  }
}>()

app.use('/api/v1/blog/*', async (c, next) => {
  //get the token
  const header = c.req.header('Authorization') || ''

  //@ts-ignore
  const response = await verify(header.split(' ')[1], c.env.JWT_SECRET)
   
  await next()
})


app.post('/api/v1/signup', async (c) => {
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password,
    },
  })

  const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    
  return c.json({ jwt: token })
})

app.post('/api/v1/signin',async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json()

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  })

  if(!user) {
    c.status(403)
    return c.json({ error: 'Invalid credentials' })
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
  return c.json({ jwt }) 
})

app.get('/api/v1/blog/:id', (c) => {
	const id = c.req.param('id')
	console.log(id);
	return c.text('get blog route')
})

app.post('/api/v1/blog', (c) => {

	return c.text('signin route')
})

app.put('/api/v1/blog', (c) => {
	return c.text('signin route')
})

export default app
