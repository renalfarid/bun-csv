import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { ResponseData } from "./lib/helper";
import { fetchCustomer } from "../customers/customerHandler";

const app = new Elysia();
const encoder = new TextEncoder();

const csvFile = '../data/customers.csv'

app.use(cors({
  origin: ({}) => true
}))
app.onError(({ code, error, set }) => {
  if (code === 'NOT_FOUND') {
    set.status = 404
    return error
  } 
  if (code === 'INTERNAL_SERVER_ERROR') {
    set.status = 500
    //const response = Response(false, set.status, {"message": error.message})
    return error
  } 
})

app.mapResponse(({ response, set }) => {
  const isJson = typeof response === 'object'

  const text = isJson
      ? JSON.stringify(response)
      : response?.toString() ?? ''

  set.headers['Content-Encoding'] = 'gzip'

  return new Response(
      Bun.gzipSync(encoder.encode(text)),
      {
          headers: {
              'Content-Type': `${
                  isJson ? 'application/json' : 'text/plain'
              }; charset=utf-8`
          }
      }
  )
})

app.trace(async ({ handle, set }) => {
  const { time, end } = await handle

   console.log(`handle;dur=${(await end) - time}`)
})

.onError(({ code, error }) => {
  return new Response(error.toString())
})

app.get("/", async () => {
   const files = await fetchCustomer();
   //const response = ResponseData(true, 200, files);
   return files;
})

app.listen(3000);
console.log(
  `🦊 Elysia is running at http://localhost:3000`
);
