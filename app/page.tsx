"use client";

import { FormEvent, useState } from "react";

type Match = {
  title: string; url: string; content: string; domain: string; screenshot: string;
  visualScore: number | null; technologies: string[]; sharedTechnologies: string[];
  technologyScore: number | null;
};
type SearchResponse = {
  source: { url: string; domain: string; screenshot: string; technologies: string[] };
  results: Match[];
  note: string;
  error?: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setData(null);
    try {
      const response = await fetch("/api/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível pesquisar.");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado na pesquisa.");
    } finally { setLoading(false); }
  }

  return (
    <main className="lf-page">
      <header className="lf-nav">
        <a className="lf-brand" href="#"><span className="lf-mark">L</span> Layout<span>Finder</span></a>
        <span className="lf-live"><i /> BUSCA NA WEB</span>
      </header>

      <section className="lf-hero">
        <div className="lf-kicker">INTELIGÊNCIA DE SIMILARIDADE DIGITAL</div>
        <h1>Encontre casas de apostas<br /><em>com estruturas semelhantes.</em></h1>
        <p>Compare aparência, organização e tecnologias detectáveis. Informe um site de referência e descubra outras plataformas relacionadas na web pública.</p>
        <form className="lf-search" onSubmit={search}>
          <span>⌕</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Cole o link de uma casa de apostas (ex.: https://exemplo.com)" aria-label="Endereço da casa de apostas" />
          <button type="submit" disabled={loading || !url.trim()}>{loading ? "PESQUISANDO..." : "ANALISAR"}</button>
        </form>
        <div className="lf-hint">A busca usa páginas públicas indexadas. Não acessa áreas privadas nem exige login.</div>
      </section>

      {loading && <section className="lf-loading"><div className="lf-spinner" /><strong>Pesquisando na web e comparando sinais...</strong><span>Isso pode levar alguns segundos.</span></section>}
      {error && <div className="lf-error">{error}</div>}

      {data && (
        <section className="lf-results">
          <div className="lf-section-head">
            <div><div className="lf-kicker">ANÁLISE CONCLUÍDA</div><h2>Resultados semelhantes</h2><p>Referência: <strong>{data.source.domain}</strong> · {data.results.length} possíveis correspondências</p></div>
          </div>
          <article className="lf-source">
            <div><span className="lf-tag">SITE DE REFERÊNCIA</span><h3>{data.source.domain}</h3><a href={data.source.url} target="_blank" rel="noreferrer">{data.source.url} ↗</a><div className="lf-tech-list">{data.source.technologies.length ? data.source.technologies.map((t) => <span key={t}>{t}</span>) : <small>Nenhuma tecnologia identificada no conteúdo extraído.</small>}</div></div>
            <img src={data.source.screenshot} alt={"Prévia visual de " + data.source.domain} />
          </article>
          {data.results.length ? <div className="lf-grid">{data.results.map((item) => (
            <article className="lf-card" key={item.domain}>
              <img className="lf-shot" src={item.screenshot} alt={"Prévia visual de " + item.domain} loading="lazy" />
              <div className="lf-card-body">
                <div className="lf-card-top"><h3>{item.title}</h3><span className="lf-domain">{item.domain}</span></div>
                <p>{item.content}</p>
                <div className="lf-scores">
                  <div><span>Similaridade de conteúdo</span><b>{item.visualScore === null ? "Sem dados" : item.visualScore + "%"}</b></div>
                  <div><span>Sinais tecnológicos em comum</span><b>{item.technologyScore === null ? "Não confirmado" : item.technologyScore + "%"}</b></div>
                </div>
                {item.sharedTechnologies.length > 0 && <div className="lf-tech-list">{item.sharedTechnologies.map((t) => <span key={t}>{t}</span>)}</div>}
                {item.technologies.length > 0 && <small className="lf-detected">Detectado: {item.technologies.join(", ")}</small>}
                <a className="lf-open" href={item.url} target="_blank" rel="noreferrer">VISITAR SITE ↗</a>
              </div>
            </article>
          ))}</div> : <div className="lf-empty">A pesquisa não encontrou correspondências suficientes. Tente outro endereço.</div>}
          <p className="lf-disclaimer">{data.note}</p>
        </section>
      )}

      {!data && !loading && !error && <section className="lf-explain">
        <div><span>01</span><h3>Busca na web</h3><p>Localiza páginas públicas relacionadas ao domínio informado.</p></div>
        <div><span>02</span><h3>Comparação visual</h3><p>Mostra prévias dos sites para comparar identidade e organização visual.</p></div>
        <div><span>03</span><h3>Rastros tecnológicos</h3><p>Procura tecnologias e fornecedores mencionados no conteúdo público.</p></div>
      </section>}

      <footer className="lf-footer"><span>LayoutFinder · Ferramenta de pesquisa e comparação</span><span>Resultados indicativos, sujeitos a verificação.</span></footer>
    </main>
  );
}
