export default function PanelExplorar({ barrio, predios, loading, error, q, setQ, destino, setDestino, estrato, setEstrato, onSelect, onLugarClick }) {
  if (loading) return <div className="p-4 text-sm text-slate-300">Cargando información catastral...</div>;
  if (error) return <div className="p-4 text-sm text-red-300">{error}</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white">Explorar &amp; Catastro</h2>
            <p className="mt-1 text-xs text-slate-400">Barrio Timiza — Localidad de Kennedy, Bogotá</p>
          </div>
          {typeof onCompartirLugar === 'function' && predioIdActivo != null ? (
            <button
              onClick={() => onCompartirLugar(predioIdActivo)}
              className="shrink-0 rounded bg-slate-800 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-700"
            >
              Compartir Lugar
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {barrio ? (
          <div className="mb-4 rounded bg-slate-800 p-4 text-xs text-slate-200">
            <div className="flex justify-between"><span>UPZ</span><span>{barrio.upz || 'UPZ 47'}</span></div>
            <div className="mt-1 flex justify-between"><span>Localidad</span><span>{barrio.localidad || 'Kennedy'}</span></div>
            <div className="mt-1 flex justify-between"><span>Área total</span><span>{barrio.area_total_ha ?? barrio.area ?? 'N/D'} ha</span></div>
            <div className="mt-1 flex justify-between"><span>Estrato predominante</span><span>{barrio.estrato_predominante || '3'}</span></div>
            <div className="mt-1 flex justify-between"><span>Avalúo total del sector</span><span>{barrio.total_avaluos ?? barrio.avaluo_total ?? 'N/D'}</span></div>
            {barrio.historia ? (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <div className="font-semibold text-slate-200">Historia del barrio</div>
                <p className="mt-1 text-slate-300">{barrio.historia}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por CHIP, dirección o nombre..."
          className="mb-3 w-full rounded bg-slate-800 p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <div className="mb-4 flex gap-2">
          <select value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full rounded bg-slate-800 p-2 text-sm text-white">
            <option value="">Todos los destinos</option>
            {['Residencial', 'Dotacional Público', 'Comercial', 'Recreacional', 'Educativo', 'Salud'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select value={estrato} onChange={(e) => setEstrato(e.target.value)} className="w-28 rounded bg-slate-800 p-2 text-sm text-white">
            <option value="">Todos</option>
            {[1, 2, 3, 4, 5, 6].map((e) => (
              <option key={e} value={String(e)}>Estrato {e}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {predios.length === 0 ? (
            <div className="rounded bg-slate-800 p-3 text-xs text-slate-400">No encontramos registros con esos filtros. Prueba con otra búsqueda o destino.</div>
          ) : null}
          {predios.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="block w-full rounded bg-slate-800 p-3 text-left text-sm text-slate-100 hover:bg-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.nombre_predio}</span>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{p.destino_economico}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">{p.direccion_oficial || 'Sin dirección'}</div>
            </button>
          ))}
        </div>
        {barrio && Array.isArray(barrio.lugares_turisticos) && barrio.lugares_turisticos.length > 0 ? (
          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-white">Lugares turísticos</div>
            <div className="space-y-2">
              {barrio.lugares_turisticos.map((l) => (
                <div key={l.nombre} className="overflow-hidden rounded bg-slate-800 cursor-pointer" onClick={() => onLugarClick && onLugarClick(l)}>
                  {l.imagen ? (
                    <img src={l.imagen} alt={l.nombre} className="h-32 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-slate-700 text-3xl">🏞️</div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{l.nombre}</span>
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{l.tipo}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{l.descripcion}</div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${l.latitud},${l.longitud}`} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded bg-slate-800 px-2 py-1 text-[10px] text-sky-300">Cómo Llegar</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {barrio && Array.isArray(barrio.resenas) && barrio.resenas.length > 0 ? (
          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold text-white">Reseñas de visitantes</div>
            <div className="space-y-2">
              {barrio.resenas.map((r) => (
                <div key={r.id} className="rounded bg-slate-800 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{r.autor}</span>
                    <span className="text-xs text-amber-400">{"\u2605".repeat(r.rating || 5)}{"\u2606".repeat(Math.max(0, 5 - (r.rating || 5)))}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{r.lugar}</div>
                  <p className="mt-1 text-xs text-slate-300">{r.texto}</p>
                  <div className="mt-1 text-[10px] text-slate-500">{r.fecha}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
