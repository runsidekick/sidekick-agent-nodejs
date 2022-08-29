import * as path from 'path';

const PROCESS_CWD = process.cwd();
const PROCESS_CWD_LENGTH = PROCESS_CWD.length + 1;

const FILE_PROTOCOL = 'file://';
// on windows on Node 11+ the file protocol needs to have three slashes
const WINDOWS_FILE_PROTOCOL = 'file:///';

// Used to match paths like file:///C:/... on windows
// but do not match paths like file:///home/... on linux
const WINDOWS_URL_REGEX = RegExp(`^${WINDOWS_FILE_PROTOCOL}[a-zA-Z]+:`);

export default class PathUtils {
    static getAbsolutePath(candidatePath: string): string {
        return path.isAbsolute(candidatePath) ? candidatePath : path.join(PROCESS_CWD, candidatePath);
    };

    static getFileExtention(filename: string) {
        return path.extname(filename);
    }

    static getRoutePath(filename: string) {
        return filename.replace(PROCESS_CWD, '');
    }
    
    static canonizeFileName(filename: string) {
        return path.normalize(filename.replace(/[\\\/]/g, '/'));
    }

    static stripFileProtocol(path: string): string {
        const lowerPath = path.toLowerCase();
        if (WINDOWS_URL_REGEX.test(lowerPath)) {
            return path.substr(WINDOWS_FILE_PROTOCOL.length);
        }

        if (lowerPath.startsWith(FILE_PROTOCOL)) {
            return path.substr(FILE_PROTOCOL.length);
        }

        return path;
    }

    static stripCurrentWorkingDirectory(path: string): string {
        // Strip 1 extra character to remove the slash.
        return PathUtils.stripFileProtocol(path).substr(PROCESS_CWD_LENGTH);
    }

    static resolveRelativePath(fullPath: string): string {
        return PathUtils.stripCurrentWorkingDirectory(fullPath);
    }

    static isPathInCurrentWorkingDirectory(path: string): boolean {
        return (PathUtils.stripFileProtocol(path).indexOf(PROCESS_CWD) === 0);
    }

    static isPathInNodeModulesDirectory(path: string): boolean {
        return PathUtils.stripFileProtocol(path).indexOf('node_modules') === 0;
    }
}