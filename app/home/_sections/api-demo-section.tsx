export const ApiDemoSection = () => {
  return (
    <section id="demo" className="py-28 px-4 mb-20">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16 intersect-once intersect:motion-preset-fade">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple API, Powerful Results
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started with just a few lines of code
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="intersect-once intersect:motion-preset-slide-right intersect:motion-delay-[200ms]">
            <h3 className="text-xl font-semibold mb-4">Fetch your articles</h3>
            <div className="bg-card border rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`// Using our TypeScript SDK
`}<span className="text-blue-400">import</span>{` { SimplistClient } `}<span className="text-blue-400">from</span>{` `}<span className="text-green-400">'@simplist.blog/sdk'</span>{`

`}<span className="text-blue-400">const</span>{` client = `}<span className="text-blue-400">new</span>{` `}<span className="text-yellow-400">SimplistClient</span>{`({
  apiKey: `}<span className="text-green-400">'pk_your_key_here'</span>{`
})

`}<span className="text-blue-400">const</span>{` articles = `}<span className="text-blue-400">await</span>{` client.`}<span className="text-yellow-400">getArticles</span>{`()`}
              </pre>
            </div>
          </div>

          <div className="intersect-once intersect:motion-preset-slide-left intersect:motion-delay-[400ms]">
            <h3 className="text-xl font-semibold mb-4">Rich response data</h3>
            <div className="bg-card border rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-muted-foreground">
{`{
  `}<span className="text-blue-400">"data"</span>{`: {
    `}<span className="text-blue-400">"id"</span>{`: `}<span className="text-green-400">"clh..."</span>{`,
    `}<span className="text-blue-400">"title"</span>{`: `}<span className="text-green-400">"My Article"</span>{`,
    `}<span className="text-blue-400">"slug"</span>{`: `}<span className="text-green-400">"my-article"</span>{`,
    `}<span className="text-blue-400">"excerpt"</span>{`: `}<span className="text-green-400">"A brief summary..."</span>{`,
    `}<span className="text-blue-400">"content"</span>{`: `}<span className="text-green-400">"Full article content..."</span>{`,
    `}<span className="text-blue-400">"coverImage"</span>{`: `}<span className="text-green-400">"https://..."</span>{`,
    `}<span className="text-blue-400">"published"</span>{`: `}<span className="text-yellow-400">true</span>{`,
    `}<span className="text-blue-400">"viewCount"</span>{`: `}<span className="text-yellow-400">142</span>{`,
    `}<span className="text-blue-400">"wordCount"</span>{`: `}<span className="text-yellow-400">850</span>{`,
    `}<span className="text-blue-400">"readTimeMinutes"</span>{`: `}<span className="text-yellow-400">4</span>{`,
    `}<span className="text-blue-400">"publishedAt"</span>{`: `}<span className="text-green-400">"2024-01-15T10:00:00Z"</span>{`
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
