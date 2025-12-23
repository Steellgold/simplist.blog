export const ApiDemoSection = () => {
  return (
    <section id="demo" className="mb-16 px-4 py-24 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="intersect-once mb-14 text-center">
          <p className="text-primary mb-2 text-sm font-medium tracking-[0.18em] uppercase">
            Built for Developers
          </p>
          <h2
            className="mb-2.5 text-3xl font-semibold md:text-4xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            From idea to published article in a few lines of code
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            Create a client, post your content, fetch it on your blog.
            That&apos;s it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <div className="intersect-once">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-[0.18em] uppercase">
              1 ・ Initialize the client
            </h3>
            <div className="bg-card rounded-2xl border p-0.5">
              <div className="bg-card overflow-x-auto rounded-xl border p-5 font-mono text-xs md:text-sm">
                <pre className="text-muted-foreground">
                  {`import `}
                  <span className="text-blue-400">{`{ SimplistClient }`}</span>
                  {` from `}
                  <span className="text-green-400">"@simplist.blog/sdk"</span>
                  {`

`}
                  <span className="text-blue-400">const</span>
                  {` client = `}
                  <span className="text-blue-400">new</span>
                  {` `}
                  <span className="text-yellow-400">SimplistClient</span>
                  {`({
  apiKey: process.env.SIMPLIST_API_KEY
})`}
                </pre>
              </div>
            </div>

            <h3 className="text-muted-foreground mt-6 mb-2 text-sm font-medium tracking-[0.18em] uppercase">
              2 ・ Fetch your published articles
            </h3>
            <div className="bg-card rounded-2xl border p-0.5">
              <div className="bg-card overflow-x-auto rounded-xl border p-5 font-mono text-xs md:text-sm">
                <pre className="text-muted-foreground">
                  {`const articles = `}
                  <span className="text-blue-400">await</span>
                  {` client.`}
                  <span className="text-yellow-400">articles</span>
                  {`.list({
  limit: 10,
  sortBy: `}
                  <span className="text-green-400">"publishedAt"</span>
                  {`,
  order: `}
                  <span className="text-green-400">"desc"</span>
                  {`,
})`}
                </pre>
              </div>
            </div>
          </div>

          <div className="intersect-once">
            <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-[0.18em] uppercase">
              3 ・ Render on your blog
            </h3>
            <div className="bg-card mb-5 rounded-2xl border p-0.5">
              <div className="bg-card overflow-x-auto rounded-xl border p-5 font-mono text-xs md:text-sm">
                <pre className="text-muted-foreground">
                  {`export async function `}
                  <span className="text-yellow-400">BlogPage</span>
                  {`() {
  `}
                  <span className="text-blue-400">const</span>
                  {` { data } = `}
                  <span className="text-blue-400">await</span>
                  {` client.`}
                  <span className="text-yellow-400">articles</span>
                  {`.list({ limit: 5 })

  `}
                  <span className="text-blue-400">return</span>
                  {` (
    <ul>
      {data.map((article) => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  )
}`}
                </pre>
              </div>
            </div>

            <h3 className="text-muted-foreground mb-2 text-sm font-medium tracking-[0.18em] uppercase">
              Sample JSON response
            </h3>
            <div className="bg-card rounded-2xl border p-0.5">
              <div className="bg-card overflow-x-auto rounded-xl border p-5 font-mono text-[11px] md:text-xs">
                <pre className="text-muted-foreground">
                  {`{
  "data": [
    {
      "id": "art_01hx...",
      "title": "Introducing our new analytics API",
      "slug": "introducing-analytics-api",
      "excerpt": "Track views, sessions and engagement...",
      "publishedAt": "2024-05-10T09:30:00Z",
      "tags": ["changelog", "product"]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
