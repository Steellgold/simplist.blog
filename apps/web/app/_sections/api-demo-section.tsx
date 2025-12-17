export const ApiDemoSection = () => {
  return (
    <section id="demo" className="py-24 md:py-28 px-4 mb-16">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14 intersect-once intersect:motion-preset-fade">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-[0.18em]">
            Built for Developers
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold mb-2.5"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            From idea to published article in a few lines of code
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a client, post your content, fetch it on your blog. That&apos;s it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="intersect-once intersect:motion-preset-slide-right intersect:motion-delay-[200ms]">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-[0.18em]">
              1 ・ Initialize the client
            </h3>
            <div className="bg-card border rounded-2xl p-0.5">
              <div className="bg-card border rounded-xl p-5 font-mono text-xs md:text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`import `}<span className="text-blue-400">{`{ SimplistClient }`}</span>{` from `}
<span className="text-green-400">"@simplist.blog/sdk"</span>
{`

`}<span className="text-blue-400">const</span>{` client = `}
<span className="text-blue-400">new</span>{` `}
<span className="text-yellow-400">SimplistClient</span>{`({
  apiKey: process.env.SIMPLIST_API_KEY,
  baseUrl: `}<span className="text-green-400">"https://api.simplist.blog"</span>{`,
})`}
                </pre>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-medium text-muted-foreground mb-2 uppercase tracking-[0.18em]">
              2 ・ Fetch your published articles
            </h3>
            <div className="bg-card border rounded-2xl p-0.5">
              <div className="bg-card border rounded-xl p-5 font-mono text-xs md:text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`const articles = `}<span className="text-blue-400">await</span>{` client.`}
<span className="text-yellow-400">articles</span>{`.list({
  limit: 10,
  sortBy: `}<span className="text-green-400">"publishedAt"</span>{`,
  order: `}<span className="text-green-400">"desc"</span>{`,
})`}
                </pre>
              </div>
            </div>
          </div>

          <div className="intersect-once intersect:motion-preset-slide-left intersect:motion-delay-[350ms]">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-[0.18em]">
              3 ・ Render on your blog
            </h3>
            <div className="bg-card border rounded-2xl p-0.5 mb-5">
              <div className="bg-card border rounded-xl p-5 font-mono text-xs md:text-sm overflow-x-auto">
                <pre className="text-muted-foreground">
{`export async function `}<span className="text-yellow-400">BlogPage</span>{`() {
  `}<span className="text-blue-400">const</span>{` { data } = `}
<span className="text-blue-400">await</span>{` client.`}
<span className="text-yellow-400">articles</span>{`.list({ limit: 5 })

  `}<span className="text-blue-400">return</span>{` (
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

            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-[0.18em]">
              Sample JSON response
            </h3>
            <div className="bg-card border rounded-2xl p-0.5">
              <div className="bg-card border rounded-xl p-5 font-mono text-[11px] md:text-xs overflow-x-auto">
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


