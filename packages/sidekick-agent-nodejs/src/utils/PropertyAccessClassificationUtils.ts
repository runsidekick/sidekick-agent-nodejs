import { PropertyAccessClassification } from "../types";

const PROPERTY_ACCESS_CLASSIFICATION = {
    ['ENUMERABLE-OWN']: (locals: { [key: string]: any }): string[] => {
      return Object.keys((locals || {}));
    },
    ['ENUMERABLE-OWN-AND-ENUMERABLE-PARENT']: (locals: { [key: string]: any }): string[] => {
      let names = new Set<string>();
      for (const local in locals) {
        names.add(local)
      }
  
      return Array.from(names);
    },
    ['ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN']: (locals: { [key: string]: any }): string[] => {
      return Object.getOwnPropertyNames((locals || {}));
    },
    ['ENUMERABLE-OWN-AND-NON-ENUMERABLE-OWN-ENUMERABLE-PARENT']: (locals: { [key: string]: any }): string[] => {
      let names = new Set<string>();
      for (const local in locals) {
        names.add(local)
      }
  
      Object.getOwnPropertyNames((locals || {})).forEach(local => names.add(local));
      return Array.from(names);
    },
}

export default class PropertyAccessClassificationUtils {
    static getProperties(
        locals: { [key: string]: any },
        classification: PropertyAccessClassification = 'ENUMERABLE-OWN'): string[] {
        if (!locals) {
            return [];
        }

        return PROPERTY_ACCESS_CLASSIFICATION[classification](locals);
    }
}