import { getCollection } from 'astro:content';

export async function GET(context: { site: URL }) {
  const articles = await getCollection('noticias');
  const sorted = articles.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  const siteUrl = context.site?.toString().replace(/\/$/, '') || 'https://nosotrasalnorte.com.mx';

  const items = sorted
    .map((article) => {
      const slug = article.id.replace(/\.md$/, '');
      const pubDate = new Date(article.data.pubDate).toUTCString();
      return `
    <item>
      <title><![CDATA[${article.data.title}]]></title>
      <link>${siteUrl}/noticias/${slug}</link>
      <guid>${siteUrl}/noticias/${slug}</guid>
      <description><![CDATA[${article.data.excerpt || article.data.subtitle || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${article.data.author}</author>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nosotras al Norte CDMX</title>
    <description>Historias, derechos y vida cotidiana desde el norte de la Ciudad de México.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>es-MX</language>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
