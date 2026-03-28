'use client';

import { useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css';

import { INITIAL_VIEW_STATE } from '../services/mapConfig'
import { LayerConfig } from '../types';

interface MapViewProps {
  layers: LayerConfig[];
}

export default function MapView({ layers }: MapViewProps) {
  const deckLayers = useMemo(() => {
    return layers
      .filter((cfg) => cfg.visible && cfg.data)
      .map((cfg) => new GeoJsonLayer({
        id: cfg.fileId,
        data: cfg.data!,
        pickable: true,
        stroked: true,
        filled: true,
        getFillColor: cfg.fillColor,
        getLineColor: cfg.strokeColor,
        getLineWidth: 1,
        lineWidthMinPixels: 1,
        opacity: cfg.opacity,
        pointRadiusMinPixels: 5,
      }));
  }, [layers]);

  debugger

  return (
    <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={deckLayers}
            style={{ width: "100%", height: "100%" }}
            getTooltip={({ object }: any) =>
          object && {
            html: `
              <div style="background:#1a1a2e;padding:10px 14px;border-radius:8px;
                          border:1px solid #2a2a4a;color:#e0e0e0;font-size:12px;
                          font-family:monospace;max-width:260px">
                ${Object.entries(object.properties || {})
                  .slice(0, 6)
                  .map(([k, v]: any) => `<div><span style="color:#888">${k}:</span> ${v}</div>`)
                  .join('')}
              </div>`,
            style: { background: 'none', border: 'none', padding: 0 },
          }
        }
        >
            <Map
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                reuseMaps
            />
        </DeckGL>
  );
}