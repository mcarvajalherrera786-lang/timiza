import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TIMIZA_CENTER = [-74.1558, 4.6115];
const TIMIZA_ZOOM = 16;
const TIMIZA_PITCH = 62;
const TIMIZA_BEARING = -25;

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

export default function Map3DTimiza({ selectedPredio, onPredioClick, createMode, onMapClick, resetToken }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tourRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [geojson, setGeojson] = useState(null);
  const [lago, setLago] = useState(null);
  const [predios, setPredios] = useState([]);

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
      map.remove();
    };
  }, [createMode, onMapClick]);

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
      </div>
      {createMode && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded bg-amber-600/90 px-4 py-2 text-sm text-white">Modo Selección en Mapa: haz clic en el mapa para capturar coordenadas</div>
      )}
    </div>
  );
}
