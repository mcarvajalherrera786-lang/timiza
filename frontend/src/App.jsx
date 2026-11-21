import { useCallback, useEffect, useState } from 'react';
import Map3DTimiza from './components/Map3DTimiza';
import PanelExplorar from './components/PanelExplorar';
import CrudModal from './components/CrudModal';
import { getBarrio, getPredios, createPredio, updatePredio, deletePredio } from './api';

export default function App() {
  const [barrio, setBarrio] = useState(null);
  const [predios, setPredios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [destino, setDestino] = useState('');
  const [estrato, setEstrato] = useState('');
  const [selected, setSelected] = useState(null);
  const [crudOpen, setCrudOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [createMode, setCreateMode] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [selectedLugar, setSelectedLugar] = useState(null);

  const loadBarrio = useCallback(async () => {
    try {
      const data = await getBarrio();
      setBarrio(data);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const loadPredios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPredios({ q, destino_economico: destino, estrato });
      setPredios(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [q, destino, estrato]);

  useEffect(() => {
    loadBarrio();
  }, [loadBarrio]);

  useEffect(() => {
    loadPredios();
  }, [loadPredios]);

  const openCreate = () => {
    setEditing(null);
    setCreateMode(true);
    setMapCoords(null);
    setCrudOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setCreateMode(false);
    setCrudOpen(true);
  };

  const submitCreate = async (payload) => {
    await createPredio(payload);
    setCrudOpen(false);
    await loadPredios();
  };

  const submitUpdate = async (id, payload) => {
    await updatePredio(id, payload);
    setCrudOpen(false);
    setSelected(null);
    await loadPredios();
  };

  const submitDelete = async (id) => {
    await deletePredio(id);
    setCrudOpen(false);
    setSelected(null);
    await loadPredios();
  };

  const handleMapClick = (lng, lat) => {
    setMapCoords({ lng, lat });
    setEditing(null);
    setCreateMode(true);
    setCrudOpen(true);
  };

  const handlePredioClick = (p) => {
    setSelected(p);
  };

  const handleLugarClick = (lugar) => {
    setSelectedLugar({ ...lugar });
  };

  const handleCompartir = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Barrio Timiza', text: 'Explora el Barrio Timiza en 3D', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado: ' + url);
      }
    } catch (e) {
      // noop
    }
  };

  const totalRegistros = Array.isArray(predios) ? predios.length : 0;
  const estratoPredominante =
    (barrio && (barrio.estrato_predominante || (barrio.estadisticas && barrio.estadisticas.estrato_predominante))) || '3';
  const area = (barrio && (barrio.area_total_ha ?? barrio.area)) ?? 'N/D';
  const avaluoTotal = (barrio && (barrio.total_avaluos ?? (barrio.estadisticas && barrio.estadisticas.total_avaluos))) ?? 'N/D';

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-white">Barrio Timiza</h1>
          <p className="text-xs text-slate-400">Barrio Timiza (UPZ 47) · Kennedy, Bogotá</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div>UPZ 47</div>
          <div>Área: {area} ha</div>
          <div>Estrato predominante: {estratoPredominante}</div>
          <div>Total registros: {totalRegistros}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCompartir}
            className="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Compartir
          </button>
          <button
            onClick={openCreate}
            className="rounded bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            + Nuevo Registro
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="h-full w-full border-r border-slate-800 md:w-96">
          <PanelExplorar
            barrio={barrio}
            predios={predios}
            loading={loading}
            error={error}
            q={q}
            setQ={setQ}
            destino={destino}
            setDestino={setDestino}
            estrato={estrato}
            setEstrato={setEstrato}
            onSelect={handlePredioClick}
            onLugarClick={handleLugarClick}
          />
        </aside>
        <main className="h-full flex-1">
          <Map3DTimiza
            selectedPredio={selected}
            onPredioClick={handlePredioClick}
            createMode={createMode}
            onMapClick={handleMapClick}
            resetToken={resetToken}
            predios={predios}
            lugares={barrio?.lugares_turisticos || []}
            selectedLugar={selectedLugar}
            onLugarClick={handleLugarClick}
          />
        </main>
      </div>

      {crudOpen ? (
        <CrudModal
          open={crudOpen}
          onClose={() => setCrudOpen(false)}
          onCreate={submitCreate}
          onUpdate={submitUpdate}
          onDelete={submitDelete}
          predio={editing}
          createMode={createMode}
          mapCoords={mapCoords}
        />
      ) : null}
    </div>
  );
}
