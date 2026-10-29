# ds

Practical programs website deployed on Vercel.

## Advertisement download counter

The advertisement download API is `/api/next-product`. It runs as a Vercel Node.js
function; PHP files are not used as server-side endpoints. The API uses Upstash Redis
`INCR` to allocate image numbers atomically across users and devices. It returns JSON
with `Content-Type: application/json` and verifies that the assigned image exists
before returning its filename.

### Vercel setup

1. Create a Redis database in Upstash and copy its REST URL and REST token.
2. In the Vercel project's **Settings > Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   Set both for every environment where you will run the site (Production, Preview,
   and Development as applicable).
3. Redeploy after adding or changing the variables. The first successful allocation
   returns `product.jfif`, followed by `product(1).jfif` through `product(20).jfif`.
   The sequence is shared by every deployment using the same Redis database and
   counter key; once all 21 images are assigned, the API returns HTTP 409.

For local Vercel testing, install/use the Vercel CLI, pull the environment variables
with `vercel env pull .env.local`, and run `vercel dev`. Do not test the API through
a static-only file server: it does not execute the serverless function.

After deployment, the production endpoint is
`https://<your-vercel-domain>/api/next-product`. A GET request returns the next
filename as JSON and consumes that image number.
