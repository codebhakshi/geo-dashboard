import {FeatureCollection}from 'geojson'
import {MetaData} from '../types'
//import { validate } from 'maplibre-gl'

export async function getGeoJSONData(path: string): Promise<FeatureCollection>{
    const res = await fetch(path) //see alternate options also

    if(!res.ok){
        throw new Error("unable to fetch jeoJSON data")
    }
    const response = await res.json()
    debugger
    if(!response || response.type !== 'FeatureCollection' || !Array.isArray(response.features)){
        throw new Error("data you provided is in wrong format")
    }

    if(response.features.length === 0){
        throw new Error("there is no features/data in file")
    }

    return response as FeatureCollection
}

export function extractMetaData(data: FeatureCollection): MetaData {
  const geometryTypes: string[] = [];

  for (const feature of data.features) {
    const type = feature.geometry?.type;

    if (type && !geometryTypes.includes(type)) {
      geometryTypes.push(type);
    }
  }

  return {
    featureCount: data.features.length,
    geometryTypes,
  };
}
