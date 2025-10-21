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
`}<span className="text-blue-400">import</span>{` { SimplistClient } `}<span className="text-blue-400">from</span>{` `}<span className="text-green-400">&apos;@simplist.blog/sdk&apos;</span>{`

`}<span className="text-blue-400">const</span>{` client = `}<span className="text-blue-400">new</span>{` `}<span className="text-yellow-400">SimplistClient</span>{`({
  apiKey: `}<span className="text-green-400">&apos;pk_your_key_here&apos;</span>{`
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
  `}<span className="text-blue-400">&quot;data&quot;</span>{`: {
    `}<span className="text-blue-400">&quot;id&quot;</span>{`: `}<span className="text-green-400">&quot;clh...&quot;</span>{`,
    `}<span className="text-blue-400">&quot;title&quot;</span>{`: `}<span className="text-green-400">&quot;My Article&quot;</span>{`,
    `}<span className="text-blue-400">&quot;slug&quot;</span>{`: `}<span className="text-green-400">&quot;my-article&quot;</span>{`,
    `}<span className="text-blue-400">&quot;excerpt&quot;</span>{`: `}<span className="text-green-400">&quot;A brief summary...&quot;</span>{`,
    `}<span className="text-blue-400">&quot;content&quot;</span>{`: `}<span className="text-green-400">&quot;Full article content...&quot;</span>{`,
    `}<span className="text-blue-400">&quot;coverImage&quot;</span>{`: `}<span className="text-green-400">&quot;https://...&quot;</span>{`,
    `}<span className="text-blue-400">&quot;published&quot;</span>{`: `}<span className="text-yellow-400">true</span>{`,
    `}<span className="text-blue-400">&quot;viewCount&quot;</span>{`: `}<span className="text-yellow-400">142</span>{`,
    `}<span className="text-blue-400">&quot;wordCount&quot;</span>{`: `}<span className="text-yellow-400">850</span>{`,
    `}<span className="text-blue-400">&quot;readTimeMinutes&quot;</span>{`: `}<span className="text-yellow-400">4</span>{`,
    `}<span className="text-blue-400">&quot;publishedAt&quot;</span>{`: `}<span className="text-green-400">&quot;2024-01-15T10:00:00Z&quot;</span>{`
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
