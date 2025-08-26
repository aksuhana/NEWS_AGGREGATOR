import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

type Article = {
  id:number; title:string; description?:string; url:string;
  image_url?:string; source:string; author?:string; category?:string; published_at:string;
};

function fmt(d:string){ try{ return new Date(d).toLocaleString(); }catch{ return d; } }

export default function Feed(){
  const [items,setItems]=useState<Article[]>([]);
  const [q,setQ]=useState(""); const [sources,setSources]=useState("");
  const [category,setCategory]=useState(""); const [author,setAuthor]=useState("");
  const [dateFrom,setFrom]=useState(""); const [dateTo,setTo]=useState("");
  const [page,setPage]=useState(1); const [last,setLast]=useState(1);
  const [loading,setLoading]=useState(false);

  async function load(p=1){
    setLoading(true);
    const r = await api.get("/articles",{ params:{ q, sources, category, author, dateFrom, dateTo, page:p }});
    setItems(r.data.data); setPage(r.data.current_page ?? 1); setLast(r.data.last_page ?? 1);
    setLoading(false);
  }
  useEffect(()=>{ load(1); },[]);

  const distinctSources = useMemo(()=> Array.from(new Set(items.map(i=>i.source))).sort(), [items]);

  return (
    <>
      <div className="filters card">
        <div className="grid">
          <input className="input" placeholder="Search…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          <input className="input" placeholder="Sources (comma)" value={sources} onChange={(e)=>setSources(e.target.value)}/>
          <input className="input" placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)}/>
          <input className="input" placeholder="Author" value={author} onChange={(e)=>setAuthor(e.target.value)}/>
          <input className="input" type="date" value={dateFrom} onChange={(e)=>setFrom(e.target.value)}/>
          <input className="input" type="date" value={dateTo} onChange={(e)=>setTo(e.target.value)}/>
          <button className="btn" onClick={()=>load(1)}>Apply</button>
        </div>
        {distinctSources.length>0 && (
          <div style={{marginTop:8, color:"#9fb0c2", fontSize:12}}>
            Popular sources: {distinctSources.slice(0,6).join(" · ")}
          </div>
        )}
      </div>

      {loading && <div className="card" style={{padding:16}}>Loading…</div>}

      <div style={{display:"grid", gap:12}}>
        {items.map(a=>(
          <article key={a.id} className="card article">
            <div className="thumb">
              {a.image_url
                ? <img src={a.image_url} alt="" loading="lazy"/>
                : <span>No image</span>}
            </div>
            <div>
              <div className="meta">{a.source} • {fmt(a.published_at)}</div>
              <div className="title">{a.title}</div>
              {a.description && <div className="desc" dangerouslySetInnerHTML={{__html:a.description}}/>}
              <div className="actions">
                <a href={a.url} target="_blank" rel="noreferrer" className="btn secondary">Read →</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{marginTop:12, display:"flex", gap:8, alignItems:"center"}}>
        <button className="btn secondary" disabled={page<=1} onClick={()=>load(page-1)}>Prev</button>
        <div style={{opacity:.8}}>Page {page} / {last}</div>
        <button className="btn" disabled={page>=last} onClick={()=>load(page+1)}>Next</button>
      </div>
    </>
  );
}
