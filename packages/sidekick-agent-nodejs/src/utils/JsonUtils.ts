export default class JsonUtils {
    static stringify = (obj: any) => {
        return JSON.stringify(obj, JsonUtils.getCircularReplacer());
    }

    static parse = (str: string) => {
        return JSON.parse(str);
    }

    static getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key: any, value: any) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
    
            seen.add(value);
          }
    
          return value;
        };
    }
}