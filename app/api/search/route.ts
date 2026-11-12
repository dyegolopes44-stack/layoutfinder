import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const TECH = [
  "Kambi", "Altenar", "BetConstruct", "EveryMatrix", "OddsMatrix",
  "OpenBet", "Sportradar", "SBTech", "Soft2Bet", "Pragmatic Play",
  "WordPress", "Shopify", "Next.js", "React", "Angular", "Vue",
  "Cloudflare", "Akamai", "Google Tag Manager"
];

function cleanUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use um endereço HTTP ou HTTPS.");
  if (url.username || url.password) throw new Error("O endereço não pode conter credenciais.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") ||
      /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host === "0.0.0.0") {
    throw new Error("Endereço local ou privado não permitido.");
  }
  return url;
}

async function tavily(path: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.tavily.com/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tavily-Access-Mode": "keyless" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Pesquisa externa indisponível (${response.status}): ${detail.slice(0, 180)}`);
  }
  return response.json();
}

function detectTech(text: string) {
  const lower = text.toLowerCase();
  return TECH.filter((name) => lower.includes(name.toLowerCase()));
}

function words(text: string) {
  return new Set((text.toLowerCase().match(/[a-z0-9]{4,}/g) || []).filter(
    (word) => !["https", "http", "www", "com", "html", "https"].includes(word)
  ));
}

function overlapScore(a: string, b: string) {
  const aa = words(a);
  const bb = words(b);
  if (!aa.size || !bb.size) return null;
  let common = 0;
  for (const word of aa) if (bb.has(word)) common++;
  return Math.round((common / Math.max(aa.size, bb.size)) * 100);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = typeof body.url === "string" ? body.url.trim() : "";
    if (!input) return NextResponse.json({ error: "Informe o endereço da casa de apostas." }, { status: 400 });

    let source: URL;
    try { source = cleanUrl(input.includes("://") ? input : `https://${input}`); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Endereço inválido." }, { status: 400 }); }

    const host = source.hostname.replace(/^www\./, "");
    const queries = [
      `casas de apostas semelhantes a ${host} sportsbook site`,
      `"${host}" sportsbook betting platform provider technology`,
      `casas de apostas com layout e plataforma parecidos com ${host}`
    ];

    const searches = await Promise.all(queries.map((query) =>
      tavily("search", { query, max_results: 8, search_depth: "advanced", topic: "general", country: "Brazil" })
    ));
    const found = new Map<string, { title: string; url: string; content: string; score: number }>();
    for (const search of searches) {
      for (const item of search.results || []) {
        try {
          const candidate = cleanUrl(item.url);
          const candidateHost = candidate.hostname.replace(/^www\./, "");
          if (candidateHost === host || candidateHost.includes(host) || host.includes(candidateHost)) continue;
          if (!found.has(candidateHost)) found.set(candidateHost, {
            title: item.title || candidateHost,
            url: candidate.toString(),
            content: item.content || "",
            score: item.score || 0
          });
        } catch { /* Ignore malformed or non-public search results. */ }
      }
    }

    const candidates = Array.from(found.values()).slice(0, 12);
    const urls = [source.toString(), ...candidates.slice(0, 8).map((item) => item.url)];
    let extracted: any = { results: [] };
    try { extracted = await tavily("extract", { urls }); } catch { /* Search results remain useful without extraction. */ }
    const pages = new Map<string, string>();
    for (const item of extracted.results || []) {
      if (item.url) pages.set(new URL(item.url).hostname.replace(/^www\./, ""), item.raw_content || item.content || "");
    }

    const sourceText = pages.get(host) || "";
    const sourceTech = detectTech(sourceText);
    const results = candidates.map((item) => {
      const candidateHost = new URL(item.url).hostname.replace(/^www\./, "");
      const pageText = pages.get(candidateHost) || item.content;
      const tech = detectTech(pageText);
      const sharedTech = sourceTech.filter((name) => tech.includes(name));
      const visualSignals = overlapScore(sourceText || host, pageText);
      const technologyScore = sourceTech.length && tech.length
        ? Math.round((sharedTech.length / Math.max(sourceTech.length, tech.length)) * 100)
        : null;
      return {
        ...item,
        domain: candidateHost,
        screenshot: `https://image.thum.io/get/width/900/crop/650/noanimate/${encodeURIComponent(item.url)}`,
        visualScore: visualSignals,
        technologies: tech,
        sharedTechnologies: sharedTech,
        technologyScore
      };
    }).sort((a, b) => ((b.technologyScore ?? -1) + (b.visualScore ?? -1)) - ((a.technologyScore ?? -1) + (a.visualScore ?? -1)));

    return NextResponse.json({
      source: { url: source.toString(), domain: host, screenshot: `https://image.thum.io/get/width/900/crop/650/noanimate/${encodeURIComponent(source.toString())}`, technologies: sourceTech },
      results,
      note: "Os indicadores são estimativas baseadas em conteúdo público indexado e sinais técnicos detectáveis. Não comprovam vínculo entre empresas nem uso da mesma plataforma."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível concluir a busca." }, { status: 500 });
  }
}
