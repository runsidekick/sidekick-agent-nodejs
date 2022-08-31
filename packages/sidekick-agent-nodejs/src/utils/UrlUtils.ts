import * as url from 'url'

export default class UrlUtils {
    static getFilePath(filename: string) {
        return url.fileURLToPath(filename);
    }

    static isEncoded(uri: string) {
        uri = uri || '';
        return uri !== decodeURIComponent(uri);
    }
}