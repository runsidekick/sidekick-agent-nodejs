export default class TypeCastUtils {
    static isPrimitive(type: string): boolean {
        return (
          type === 'undefined' ||
          type === 'boolean' ||
          type === 'number' ||
          type === 'string' ||
          type === 'symbol'
        );
    }

    static isObject(type: string): boolean {
        return type === 'object';
    }

    static isArray(value: any): boolean {
        return Array.isArray(value);
    }

    static isFunction(type: string): boolean {
        return type === 'function';
    }

    static castToType(value: any, type: string) {
        if (!TypeCastUtils.isPrimitive(type) || value == '') {
            return value;
        }

        let result = value; 
        try {
            switch(type) {
                case 'number':
                    result = typeof value == 'string' ? Number(value): value;
                    break;
                case 'boolean':
                    result = typeof value == 'string' ? value === 'true': value;
                    break;
           }
        } finally {
            return result;
        }
    }
}