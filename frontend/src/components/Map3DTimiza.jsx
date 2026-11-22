import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TIMIZA_CENTER = [-74.1558, 4.6115];
const TIMIZA_ZOOM = 16;
const TIMIZA_PITCH = 62;
const TIMIZA_BEARING = -25;

const IMAGEN_TOUR = 'https://upload.wikimedia.org/wikipedia/commons/a/af/Parque_Timiza%2C_Bogot%C3%A1.jpg';

const STOPS_TURISTICOS = [
  {
    nombre: 'Lago Timiza',
    latitud: 4.605,
    longitud: -74.145,
    tipo: 'Lago Recreativo',
    descripcion: 'Lago artificial de recreación del barrio, rodeado de senderos y zonas verdes.',
    imagen: IMAGEN_TOUR,
    horas: 'Abierto todo el día',
    tips: 'Llegar temprano; zona de baños disponible.',
  },
  {
    nombre: 'Parque Metropolitano Timiza',
    latitud: 4.6115,
    longitud: -74.1558,
    tipo: 'Parque Natural',
    descripcion: 'Pulmón verde de Kennedy con lago, ciclorrutas y canchas. Inaugurado en 2021.',
    imagen: IMAGEN_TOUR,
    horas: '6:00 a.m. - 6:00 p.m.',
    tips: 'Ciclorruta y canchas; +2.652 árboles.',
  },
  {
    nombre: 'Estadio de Fútbol Timiza',
    latitud: 4.609,
    longitud: -74.15,
    tipo: 'Deporte',
    descripcion: 'Estadio de fútbol del barrio con canchas y tribunas.',
    imagen: IMAGEN_TOUR,
    horas: 'Disponible para uso deportivo',
    tips: 'Torneos deportivos frecuentes.',
  },
  {
    nombre: 'Corredor Gastronómico Av. Villavicencio',
    latitud: 4.612,
    longitud: -74.152,
    tipo: 'Gastronomía',
    descripcion: 'Corredor gastronómico de la Avenida Villavicencio con restaurantes y cafés.',
    imagen: IMAGEN_TOUR,
    horas: 'Horarios de comercio',
    tips: 'Ideal para parrilla y cafés.',
  },
  {
    nombre: 'Zona Cultural',
    latitud: 4.612,
    longitud: -74.156,
    tipo: 'Cultura',
    descripcion: 'Espacios culturales y recreativos del barrio.',
    imagen: IMAGEN_TOUR,
    horas: 'Abierto',
    tips: 'Eventos culturales.',
  },
];

const COLORES_DESTINO = {
  Parque: '#22c55e',
  Recreacional: '#22c55e',
  Dotacional_Publico: '#3b82f6',
  Educativo: '#3b82f6',
  Comercial: '#f59e0b',
  Residencial: '#8b5cf6',
  Salud: '#ef4444',
};

function colorDestino(destino) {
  const d = String(destino || '');
  if (d.toLowerCase().includes('parque') || d.toLowerCase().includes('recreacional')) return '#22c55e';
  if (d.toLowerCase().includes('educativ') || d.toLowerCase().includes('dotacional')) return '#3b82f6';
  if (d.toLowerCase().includes('comercial')) return '#f59e0b';
  if (d.toLowerCase().includes('residencial')) return '#8b5cf6';
  if (d.toLowerCase().includes('salud')) return '#ef4444';
  return '#38bdf8';
}

function findNearestLugar(lng, lat, lugares) {
  if (!Array.isArray(lugares) || lugares.length === 0) return null;
  let best = null;
  let bestDist = Infinity;
  for (const l of lugares) {
    const d = Math.hypot(
      (l.longitud - lng) * Math.cos((l.latitud * Math.PI) / 180),
      (l.latitud - lat) * (Math.PI / 180)
    );
    if (d < bestDist) { bestDist = d; best = l; }
  }
  return bestDist <= 0.005 ? best : null;
}

export default function Map3DTimiza({ selectedPredio, onPredioClick, createMode, onMapClick, resetToken, lugares = [], selectedLugar = null, onLugarClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tourRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [geojson, setGeojson] = useState(null);
  const [lago, setLago] = useState(null);
  const [predios, setPredios] = useState([]);
  const [tourActivo, setTourActivo] = useState(false);
  const [tourStop, setTourStop] = useState(null);
  const tourTimer = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: TIMIZA_CENTER,
      zoom: TIMIZA_ZOOM,
      pitch: TIMIZA_PITCH,
      bearing: TIMIZA_BEARING,
      antialias: true,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    map.on('click', (e) => {
      if (createMode && onMapClick) {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
        return;
      }
      const lugar = findNearestLugar(e.lngLat.lng, e.lngLat.lat, lugares);
      if (lugar) {
        map.flyTo({ center: [lugar.longitud, lugar.latitud], zoom: TIMIZA_ZOOM, duration: 1500 });
        map.openPopup({
          id: 'lugar-popup',
          lngLat: [lugar.longitud, lugar.latitud],
          content: `<div style="min-width:180px"><img src="${lugar.imagen}" alt="${lugar.nombre}" style="width:100%;height:90px;object-fit:cover;border-radius:6px" /><h3 style="margin:6px 0 2px;font-size:14px;color:#fff">${lugar.nombre}</h3><p style="margin:0;font-size:12px;color:#cbd5e1">${lugar.tipo}</p><a href="https://www.google.com/maps/dir/?api=1&destination=${lugar.latitud},${lugar.longitud}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:6px;padding:4px 8px;background:#0ea5e9;color:#fff;border-radius:6px;font-size:11px;text-decoration:none">Cómo Llegar</a></div>`,
        });
      }
    });

    map.on('load', async () => {
      // Polígono del barrio + lagos
      try {
        const res = await fetch('http://localhost:8000/api/v1/barrio');
        const data = await res.json();
        if (data && data.geojson) {
          setGeojson(data.geojson);
          const src = map.addSource('timiza-boundary', {
            type: 'geojson',
            data: data.geojson,
          });
          map.addLayer({
            id: 'timiza-boundary-fill',
            type: 'fill',
            source: 'timiza-boundary',
            paint: { 'fill-color': '#3388ff', 'fill-opacity': 0.08 },
          });
          map.addLayer({
            id: 'timiza-boundary-line',
            type: 'line',
            source: 'timiza-boundary',
            paint: { 'line-color': '#38bdf8', 'line-width': 2 },
          });
        }
        if (data && data.estadisticas) {
          // lago info
        }
      } catch (e) {
        // noop
      }
      setReady(true);
    });

    return () => {
      if (tourRef.current) cancelAnimationFrame(tourRef.current);
      window.clearTimeout(tourTimer.current);
      map.remove();
    };
  }, [createMode, onMapClick, lugares]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (selectedPredio) {
      mapRef.current.flyTo({
        center: [selectedPredio.longitud, selectedPredio.latitud],
        zoom: Math.max(16, (mapRef.current.getZoom() || 16) + 1),
        pitch: 62,
        bearing: -25,
        duration: 1500,
      });
    }
  }, [selectedPredio, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (selectedLugar) {
      mapRef.current.flyTo({ center: [selectedLugar.longitud, selectedLugar.latitud], zoom: TIMIZA_ZOOM, duration: 1500 });
      mapRef.current.openPopup({
        id: 'lugar-popup',
        lngLat: [selectedLugar.longitud, selectedLugar.latitud],
        content: `<div style="min-width:180px"><img src="${selectedLugar.imagen}" alt="${selectedLugar.nombre}" style="width:100%;height:90px;object-fit:cover;border-radius:6px" /><h3 style="margin:6px 0 2px;font-size:14px;color:#fff">${selectedLugar.nombre}</h3><p style="margin:0;font-size:12px;color:#cbd5e1">${selectedLugar.tipo}</p><a href="https://www.google.com/maps/dir/?api=1&destination=${selectedLugar.latitud},${selectedLugar.longitud}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:6px;padding:4px 8px;background:#0ea5e9;color:#fff;border-radius:6px;font-size:11px;text-decoration:none">Cómo Llegar</a></div>`,
      });
    }
  }, [selectedLugar, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    if (resetToken) {
      map.flyTo({ center: [resetToken.lng || TIMIZA_CENTER[0], resetToken.lat || TIMIZA_CENTER[1]], zoom: 16, duration: 1500 });
    }
  }, [resetToken, ready]);

  const startTour = () => {
    if (tourRef.current) return;
    let frame = 0;
    const start = performance.now();
    const dur = 8000;
    const step = (now) => {
      const t = (now - start) / dur;
      if (t >= 1) {
        if (tourRef.current) cancelAnimationFrame(tourRef.current);
        tourRef.current = null;
        return;
      }
      mapRef.current?.easeTo({ bearing: -25 + 360 * t, duration: 16 });
      tourRef.current = requestAnimationFrame(step);
    };
    tourRef.current = requestAnimationFrame(step);
  };

  const stopTour = () => {
    if (tourRef.current) {
      cancelAnimationFrame(tourRef.current);
      tourRef.current = null;
    }
  };

  const iniciarTour = () => {
    let i = 0;
    const run = () => {
      if (i >= STOPS_TURISTICOS.length) {
        setTourActivo(false);
        setTourStop(null);
        return;
      }
      const s = STOPS_TURISTICOS[i];
      setTourStop(s);
      setTourActivo(true);
      mapRef.current?.flyTo({ center: [s.longitud, s.latitud], zoom: 16, pitch: 62, bearing: -25, duration: 1800 });
      window.clearTimeout(tourTimer.current);
      tourTimer.current = window.setTimeout(run, 2200);
    };
    run();
  };

  const siguienteParada = () => {
    const idx = STOPS_TURISTICOS.findIndex((s) => s.nombre === tourStop?.nombre);
    const next = STOPS_TURISTICOS[(idx + 1) % STOPS_TURISTICOS.length];
    setTourStop(next);
    mapRef.current?.flyTo({ center: [next.longitud, next.latitud], zoom: 16, pitch: 62, bearing: -25, duration: 1800 });
  };

  const cerrarTour = () => {
    setTourActivo(false);
    setTourStop(null);
  };

  const flyToLago = () => {
    mapRef.current?.flyTo({ center: [-74.16, 4.607], zoom: 16, duration: 1800 });
  };

  const setVista3D = () => mapRef.current?.easeTo({ pitch: 62, duration: 800 });
  const setVista2D = () => mapRef.current?.easeTo({ pitch: 0, duration: 800 });

  if (!ready) return <div ref={containerRef} className="h-full w-full" />;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        <button onClick={setVista3D} className="rounded bg-slate-900/80 px-3 py-2 text-xs text-white">Vista 3D Inclinada</button>
        <button onClick={setVista2D} className="rounded bg-slate-900/80 px-3 py-2 text-xs text-white">Vista Cenital 2D</button>
        <button onClick={startTour} className="rounded bg-slate-900/80 px-3 py-2 text-xs text-white">Tour Orbital Timiza</button>
        <button onClick={flyToLago} className="rounded bg-slate-900/80 px-3 py-2 text-xs text-white">Reiniciar Cámara al Lago Timiza</button>
        <button onClick={iniciarTour} className="rounded bg-sky-600 px-3 py-2 text-xs font-semibold text-white">Iniciar Tour Turístico</button>
      </div>
      {tourActivo && tourStop && (
        <div className="absolute bottom-4 left-4 right-4 z-10 rounded bg-slate-900/95 p-4 shadow-lg">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-sky-400">{tourStop.tipo}</div>
              <div className="text-sm font-bold text-white">{tourStop.nombre}</div>
              <div className="mt-1 text-xs text-slate-300">{tourStop.descripcion}</div>
              <div className="mt-1 text-[10px] text-slate-400">Horario: {tourStop.horas}</div>
              <div className="mt-1 text-[10px] text-slate-400">Tips: {tourStop.tips}</div>
            </div>
            <button onClick={cerrarTour} className="rounded bg-slate-800 px-2 py-1 text-[10px] text-white">Cerrar</button>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={siguienteParada} className="rounded bg-sky-600 px-3 py-2 text-xs font-semibold text-white">Siguiente Parada</button>
          </div>
        </div>
      )}
      {createMode && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded bg-amber-600/90 px-4 py-2 text-sm text-white">Modo Selección en Mapa: haz clic en el mapa para capturar coordenadas</div>
      )}
    </div>
  );
}
