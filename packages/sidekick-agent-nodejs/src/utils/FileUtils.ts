import * as fs from 'fs';
import PathUtils from './PathUtils';

export default class FileUtils {
    static isFileTypescript(filename: string) {
        return PathUtils.getFileExtention(filename) === '.ts'
    }

    static statSync(filename: string) {
        return fs.statSync(filename);
    }
}