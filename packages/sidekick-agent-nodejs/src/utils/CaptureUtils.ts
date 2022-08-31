import PathUtils from './PathUtils';

const resolvableFrameFullPathResults: Map<string, boolean> = new Map<string, boolean>();

export default class CaptureUtils {
    static formatValue(type: string, value: any) {
        if (value === undefined) {
            return '';
        }

        switch(type) {
            case 'number':
            case 'boolean':
                return value;
            default:
                return String(value);
        }
    }

    static shouldFramePathBeResolved(frameFullPath: string): boolean {
        if (resolvableFrameFullPathResults.has(frameFullPath)) {
            return resolvableFrameFullPathResults.get(frameFullPath);
        }

        let result = true;
        // Only capture data from the frames for which we can link the data back
        // to the source files.
        if (!PathUtils.isPathInCurrentWorkingDirectory(frameFullPath)) {
            result = false;
        }
    
        if (result && PathUtils.isPathInNodeModulesDirectory(PathUtils.resolveRelativePath(frameFullPath))) {
            result = false;
        }

        if (resolvableFrameFullPathResults.size > 10000) {
            resolvableFrameFullPathResults.clear();
        }

        resolvableFrameFullPathResults.set(frameFullPath, result);
        return result;
    }
}