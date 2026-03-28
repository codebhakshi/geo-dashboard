'use client';

import { getGeoJSONData, extractMetaData } from "../services/geodataLoader";
import { GeoJSONFile, LayerConfig, MetaData } from "../types";
import React,{ useEffect, useState } from 'react';
import { hexToRgba } from "../utils/hexToRgbaConverter";
import { Layers, Database, Settings2, MapPin, Eye, EyeOff, X, Loader2 } from "lucide-react";

interface SidebarProps {
  onLayersChange: (layers: LayerConfig[]) => void;
}

const FILL_PRESETS: [number, number, number][] = [
  [99, 102, 241],
  [6, 182, 212],
  [245, 158, 11],
  [16, 185, 129],
  [244, 63, 94],
];

const STROKE_PRESETS: [number, number, number][] = [
  [255, 255, 255],
  [99, 102, 241],
  [245, 158, 11],
];

function SideBar({ onLayersChange }: SidebarProps) {
  const [error, setError] = useState<string>('');
  const [files, setFiles] = useState<GeoJSONFile[]>([]);
  const [layers, setLayers] = useState<LayerConfig[]>([]);
  const [loading, setLoading] = useState<string>('');
  const [meta, setMeta] = useState<{ [key: string]: MetaData }>({});

  useEffect(() => {
    fetch('/data/files.json')
      .then((res) => res.json())
      .then((res) => setFiles(res))
      .catch(() => setError("Unable to fetch files"));
  }, []);

  useEffect(() => {
    onLayersChange(layers);
  }, [layers, onLayersChange]);

  const handleFileSelect = async (file: GeoJSONFile) => {
    if (layers.find((l) => l.fileId === file.id)) return;
    setLoading(file.id);
    setError('');
    try {
      const data = await getGeoJSONData(file.path);
      const fileMeta = extractMetaData(data);
      const newLayer: LayerConfig = {
        fileId: file.id,
        data,
        visible: true,
        fillColor: [99, 102, 241, 180],
        strokeColor: [255, 255, 255, 220],
        opacity: 0.8,
      };
      setLayers((prev) => [...prev, newLayer]);
      setMeta((prev) => ({ ...prev, [file.id]: fileMeta }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const updateLayer = (fileId: string, changes: Partial<LayerConfig>) => {
    setLayers((prev) =>
      prev.map((l) => (l.fileId === fileId ? { ...l, ...changes } : l))
    );
  };

  const removeLayer = (fileId: string) => {
    setLayers((prev) => prev.filter((l) => l.fileId !== fileId));
    setMeta((prev) => {
      const next = { ...prev };
      delete next[fileId];
      return next;
    });
  };

  return (
    <aside className="w-[30%] h-screen flex flex-col overflow-hidden bg-zinc-900/50 backdrop-blur-xl border-r border-indigo-500/10 shadow-2xl">

      <div className="p-5 border-b border-indigo-500/10 flex items-center gap-3 flex-shrink-0">
        <div className="p-2 bg-indigo-500/15 rounded-xl">
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-wide">GeoDashboard</h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">Load and style spatial layers</p>
        </div>
      </div>

      <div className="p-4 border-b border-indigo-500/10 flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          <Database className="w-3.5 h-3.5" />
          Available Files
        </div>

        <div className="space-y-2">
          {files.map((file) => {
            const isLoaded = layers.some((l) => l.fileId === file.id);
            const isLoading = loading === file.id;
            return (
              <button
                key={file.id}
                onClick={() => handleFileSelect(file)}
                disabled={isLoaded || isLoading}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-[12px] border transition-all duration-200 flex items-center justify-between gap-2
                  ${isLoaded
                    ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400 cursor-default'
                    : 'bg-white/3 border-white/6 text-zinc-400 hover:bg-white/7 hover:text-zinc-200 cursor-pointer'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLoaded ? 'bg-emerald-400 shadow-[0_0_6px_#4ade80]' : 'bg-zinc-600'}`} />
                  {file.name}
                </span>
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-3 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            ⚠ {error}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
          <Settings2 className="w-3.5 h-3.5" />
          Active Layers
        </div>

        {layers.length === 0 && (
          <p className="text-[11px] text-zinc-600 italic py-4 text-center">No layers loaded yet</p>
        )}

        {layers.map((layer) => {
          const file = files.find((f) => f.id === layer.fileId);
          const layerMeta = meta[layer.fileId];

          return (
            <div key={layer.fileId} className="bg-white/3 border border-indigo-500/10 rounded-2xl p-4 space-y-3">

              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-zinc-200 truncate">
                  {file?.name ?? layer.fileId}
                </span>
                <button
                  onClick={() => removeLayer(layer.fileId)}
                  className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {layerMeta && (
                <div className="bg-black/20 rounded-lg px-3 py-2 text-[11px] text-zinc-500 flex gap-2">
                  <span>{layerMeta.featureCount} features</span>
                  <span>·</span>
                  <span>{layerMeta.geometryTypes.join(', ')}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Visibility</span>
                <button
                  onClick={() => updateLayer(layer.fileId, { visible: !layer.visible })}
                  className={`p-1.5 rounded-lg transition-colors ${
                    layer.visible
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-zinc-700/50 text-zinc-500'
                  }`}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400">Fill Color</span>
                <div className="flex gap-2 items-center">
                  {FILL_PRESETS.map((c) => {
                    const isActive = layer.fillColor.slice(0, 3).join(',') === c.join(',');
                    return (
                      <button
                        key={c.join(',')}
                        onClick={() => updateLayer(layer.fileId, { fillColor: [...c, 180] as [number, number, number, number] })}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${isActive ? 'ring-2 ring-white scale-110' : ''}`}
                        style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }}
                      />
                    );
                  })}
                  <input
                    type="color"
                    defaultValue="#6366f1"
                    onChange={(e) => updateLayer(layer.fileId, { fillColor: hexToRgba(e.target.value, 180) })}
                    className="w-5 h-5 rounded-full cursor-pointer bg-transparent border-none"
                    title="Custom fill color"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400">Stroke</span>
                <div className="flex gap-2 items-center">
                  {STROKE_PRESETS.map((c) => {
                    const isActive = layer.strokeColor.slice(0, 3).join(',') === c.join(',');
                    return (
                      <button
                        key={c.join(',')}
                        onClick={() => updateLayer(layer.fileId, { strokeColor: [...c, 220] as [number, number, number, number] })}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${isActive ? 'ring-2 ring-white scale-110' : 'ring-1 ring-zinc-600'}`}
                        style={{ backgroundColor: `rgb(${c[0]},${c[1]},${c[2]})` }}
                      />
                    );
                  })}
                  <input
                    type="color"
                    defaultValue="#ffffff"
                    onChange={(e) => updateLayer(layer.fileId, { strokeColor: hexToRgba(e.target.value, 220) })}
                    className="w-5 h-5 rounded-full cursor-pointer bg-transparent border-none"
                    title="Custom stroke color"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Opacity</span>
                  <span>{Math.round(layer.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={layer.opacity}
                  onChange={(e) => updateLayer(layer.fileId, { opacity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {layerMeta && (
                <div className="pt-1 border-t border-indigo-500/10">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3" />
                    Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-black/20 border border-indigo-500/10 rounded-xl">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">Features</p>
                      <p className="text-lg font-semibold text-white mt-0.5">{layerMeta.featureCount}</p>
                    </div>
                    <div className="p-2.5 bg-black/20 border border-indigo-500/10 rounded-xl">
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">Types</p>
                      <p className="text-[11px] font-semibold text-white mt-0.5 truncate">
                        {layerMeta.geometryTypes.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </aside>
  );
}

export default React.memo(SideBar)