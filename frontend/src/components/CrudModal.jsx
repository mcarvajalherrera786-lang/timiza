import { useState } from 'react';

const DESTINOS = ['Residencial', 'Dotacional Público', 'Comercial', 'Recreacional', 'Educativo', 'Salud'];

export default function CrudModal({ open, onClose, onCreate, onUpdate, onDelete, predio, createMode, mapCoords }) {
  const [form, setForm] = useState({
    chip: '',
    cedula_catastral: '',
    nombre_predio: '',
    direccion_oficial: '',
    barrio: 'Timiza',
    sector_catastral: '',
    estrato: '',
    destino_economico: 'Residencial',
    uso_suelo: '',
    area_terreno_m2: '',
    area_construida_m2: '',
    num_pisos: '',
    avaluo_catastral_cop: '',
    valor_m2_cop: '',
    estado_conservacion: 'En buen estado',
    latitud: '',
    longitud: '',
    altura_extrusion_m: '0',
    observaciones: '',
  });

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitCreate = () => {
    const payload = {
      chip: form.chip,
      cedula_catastral: form.cedula_catastral,
      nombre_predio: form.nombre_predio,
      direccion_oficial: form.direccion_oficial || undefined,
      barrio: form.barrio || 'Timiza',
      sector_catastral: form.sector_catastral || undefined,
      estrato: form.estrato ? Number(form.estrato) : undefined,
      destino_economico: form.destino_economico,
      uso_suelo: form.uso_suelo || undefined,
      area_terreno_m2: Number(form.area_terreno_m2) || 0,
      area_construida_m2: Number(form.area_construida_m2) || 0,
      num_pisos: form.num_pisos ? Number(form.num_pisos) : undefined,
      avaluo_catastral_cop: Number(form.avaluo_catastral_cop) || 0,
      valor_m2_cop: form.valor_m2_cop ? Number(form.valor_m2_cop) : undefined,
      estado_conservacion: form.estado_conservacion || undefined,
      latitud: Number(form.latitud) || undefined,
      longitud: Number(form.longitud) || undefined,
      altura_extrusion_m: Number(form.altura_extrusion_m) || 0,
      observaciones: form.observaciones || undefined,
    };
    onCreate(payload);
  };

  const submitUpdate = () => {
    const payload = {
      chip: form.chip,
      cedula_catastral: form.cedula_catastral,
      nombre_predio: form.nombre_predio,
      direccion_oficial: form.direccion_oficial || undefined,
      barrio: form.barrio || 'Timiza',
      sector_catastral: form.sector_catastral || undefined,
      estrato: form.estrato ? Number(form.estrato) : undefined,
      destino_economico: form.destino_economico,
      uso_suelo: form.uso_suelo || undefined,
      area_terreno_m2: Number(form.area_terreno_m2) || 0,
      area_construida_m2: Number(form.area_construida_m2) || 0,
      num_pisos: form.num_pisos ? Number(form.num_pisos) : undefined,
      avaluo_catastral_cop: Number(form.avaluo_catastral_cop) || 0,
      valor_m2_cop: form.valor_m2_cop ? Number(form.valor_m2_cop) : undefined,
      estado_conservacion: form.estado_conservacion || undefined,
      latitud: Number(form.latitud) || undefined,
      longitud: Number(form.longitud) || undefined,
      altura_extrusion_m: Number(form.altura_extrusion_m) || 0,
      observaciones: form.observaciones || undefined,
    };
    onUpdate(predio.id, payload);
  };

  const submitDelete = () => {
    if (predio) onDelete(predio.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-slate-900 p-6 text-slate-100 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{predio ? 'Editar Catastro' : 'Registrar Predio'}</h3>
          <button onClick={onClose} className="rounded bg-slate-800 px-3 py-1 text-sm text-slate-300">Cerrar</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input value={form.chip} onChange={(e) => set('chip', e.target.value)} placeholder="CHIP" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.cedula_catastral} onChange={(e) => set('cedula_catastral', e.target.value)} placeholder="Cédula Catastral" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.nombre_predio} onChange={(e) => set('nombre_predio', e.target.value)} placeholder="Nombre del predio" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.direccion_oficial} onChange={(e) => set('direccion_oficial', e.target.value)} placeholder="Dirección oficial" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <select value={form.destino_economico} onChange={(e) => set('destino_economico', e.target.value)} className="rounded bg-slate-800 p-2 text-sm text-white">
            {DESTINOS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input value={form.estrato} onChange={(e) => set('estrato', e.target.value)} placeholder="Estrato (1-6)" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.area_terreno_m2} onChange={(e) => set('area_terreno_m2', e.target.value)} placeholder="Área terreno m2" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.area_construida_m2} onChange={(e) => set('area_construida_m2', e.target.value)} placeholder="Área construida m2" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.num_pisos} onChange={(e) => set('num_pisos', e.target.value)} placeholder="Nº pisos" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.avaluo_catastral_cop} onChange={(e) => set('avaluo_catastral_cop', e.target.value)} placeholder="Avalúo catastral COP" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.valor_m2_cop} onChange={(e) => set('valor_m2_cop', e.target.value)} placeholder="Valor m2 COP" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.latitud} onChange={(e) => set('latitud', e.target.value)} placeholder="Latitud" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.longitud} onChange={(e) => set('longitud', e.target.value)} placeholder="Longitud" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.altura_extrusion_m} onChange={(e) => set('altura_extrusion_m', e.target.value)} placeholder="Altura extrusión m" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <input value={form.estado_conservacion} onChange={(e) => set('estado_conservacion', e.target.value)} placeholder="Estado de conservación" className="rounded bg-slate-800 p-2 text-sm text-white" />
          <textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} placeholder="Observaciones" className="rounded bg-slate-800 p-2 text-sm text-white sm:col-span-2" />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-slate-800 px-4 py-2 text-sm text-slate-200">Cancelar</button>
          {predio ? (
            <button onClick={submitUpdate} className="rounded bg-sky-600 px-4 py-2 text-sm text-white">Guardar Cambios</button>
          ) : (
            <button onClick={submitCreate} className="rounded bg-sky-600 px-4 py-2 text-sm text-white">Crear Predio</button>
          )}
          {predio ? (
            <button onClick={submitDelete} className="rounded bg-red-600 px-4 py-2 text-sm text-white">Eliminar</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
