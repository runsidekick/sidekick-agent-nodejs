export default class OsUtils {
    static isWindows(): boolean {
        return process.platform === 'win32';
    };
}