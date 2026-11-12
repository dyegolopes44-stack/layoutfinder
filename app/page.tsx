"use client";

import { useMemo, useState } from "react";

type Reference = {
  name: string;
  url: string;
  category: string;
  style: string;
  description: string;
  initials: string;
  tone: string;
};

const references: Reference[] = [
  { name: "Linear", url: "https://linear.app", category: "SaaS", style: "Minimalista", description: "Interface limpa, hierarquia forte e foco no produto.", initials: "L", tone: "violet" },
  { name: "Stripe", url: "https://stripe.com", category: "Institucional", style: "Gradientes", description: "Landing page marcante com cores, movimento e clareza.", initials: "S", tone: "blue" },
  { name: "Notion", url: "https://notion.so", category: "SaaS", style: "Minimalista", description: "Design editorial simples e comunicação direta.", initials: "N", tone: "ink" },
  { name: "Framer", url: "https://framer.com", category: "Portfólio", style: "Criativo", description: "Composição visual ousada e animações expressivas.", initials: "F", tone: "pink" },
  { name: "Vercel", url: "https://vercel.com", category: "Tecnologia", style: "Minimalista", description: "Visual técnico, tipografia forte e bastante espaço.", initials: "V", tone: "ink" },
  { name: "Airbnb", url: "https://airbnb.com", category: "E-commerce", style: "Editorial", description: "Fotografia protagonista e navegação intuitiva.", initials: "A", tone: "coral" },
  { name: "Webflow", url: "https://webflow.com", category: "Tecnologia", style: "Gradientes", description: "Apresentação de produto com seções bem definidas.", initials: "W", tone: "blue" },
  { name: "Aesop", url: "https://aesop.com", category: "E-commerce", style: "Editorial", description: "Estética sofisticada, editorial e minimalista.", initials: "A", tone: "olive" },
];

const categories = ["Todos", "SaaS", "Institucional", "Portfólio", "E-commerce", "Tecnologia"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return references.filter((item) => {
      const matchesCategory = category === "Todos" || item.category === category;
      const matchesQuery =
        !normalized ||
        [item.name, item.category, item.style, item.description].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#" aria-label="LayoutFinder início">
          <span className="brand-mark">L</span>
          <span>layout<span className="brand-light">finder</span></span>
        </a>
        <div className="nav-right">
          <a href="#explorar">Explorar referências</a>
          <span className="status"><i /> versão inicial</span>
        </div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow"><span>✳</span> SUA PRÓXIMA IDEIA COMEÇA AQUI</div>
        <h1>Encontre o layout<br /><span>que dá forma à sua ideia.</span></h1>
        <p className="hero-copy">Pesquise referências visuais, explore estilos e descubra sites que podem inspirar seu próximo projeto.</p>

        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque por nome, estilo ou tipo de site..."
            aria-label="Buscar referências"
          />
          {query && <button className="clear" onClick={() => setQuery("")} aria-label="Limpar busca">×</button>}
          <span className="search-hint">BUSCAR</span>
        </div>
        <div className="quick-search">
          <span>Experimente:</span>
          {["minimalista", "SaaS", "gradientes", "portfólio"].map((term) => (
            <button key={term} onClick={() => setQuery(term)}>{term}</button>
          ))}
        </div>
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
      </section>

      <section className="explore shell" id="explorar">
        <div className="section-heading">
          <div>
            <div className="eyebrow muted">BIBLIOTECA DE INSPIRAÇÃO</div>
            <h2>Explore referências</h2>
            <p>Uma seleção inicial de sites para alimentar suas ideias.</p>
          </div>
          <span className="result-count">{filtered.length} resultados</span>
        </div>

        <div className="filters" aria-label="Filtrar por categoria">
          {categories.map((item) => (
            <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="cards">
            {filtered.map((item) => (
              <article className="reference-card" key={item.name}>
                <div className={"preview " + item.tone}>
                  <div className="preview-top"><span className="preview-brand">{item.initials}</span><span className="preview-menu">•••</span></div>
                  <div className="preview-lines"><span /><span /><span /></div>
                  <div className="preview-shape" />
                  <span className="preview-label">INSPIRAÇÃO / {item.category.toUpperCase()}</span>
                </div>
                <div className="card-info">
                  <div className="card-title-row"><h3>{item.name}</h3><span className="style-tag">{item.style}</span></div>
                  <p>{item.description}</p>
                  <a href={item.url} target="_blank" rel="noreferrer">Visitar site <span>↗</span></a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty"><span>⌕</span><h3>Nenhuma referência encontrada</h3><p>Tente outro termo ou selecione uma categoria diferente.</p><button onClick={() => { setQuery(""); setCategory("Todos"); }}>Limpar filtros</button></div>
        )}
      </section>

      <section className="bottom-cta shell">
        <div><span className="eyebrow">EM CONSTRUÇÃO</span><h2>Mais referências.<br />Mais possibilidades.</h2><p>Esta é a primeira versão do LayoutFinder. A busca ampliada e a captura automática de layouts serão adicionadas nas próximas etapas.</p></div>
        <div className="cta-symbol">✳</div>
      </section>

      <footer className="footer shell"><a className="brand" href="#"><span className="brand-mark">L</span><span>layout<span className="brand-light">finder</span></span></a><span>Feito para encontrar boas ideias. © 2026 LayoutFinder</span></footer>
    </main>
  );
}