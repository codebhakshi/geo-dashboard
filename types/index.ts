import {FeatureCollection} from 'geojson'

export interface GeoJSONFile{
    id: string,
    name: string,
    path: string
}

export interface MetaData {
    featureCount: number,
    geometryTypes: string[]
}

export interface LayerConfig {
  fileId: string;
  data: FeatureCollection | null;
  visible: boolean;
  fillColor: [number, number, number, number];
  strokeColor: [number, number, number, number];
  opacity: number;
}