export default class VersionUtils {
    static validateVersion(major: number, minor = 0, patch = 0) {
        let [runtimeMajor, runtimeMinor, runtimePatch] = process.version.substr(1).split('.');
        const parsedMajor = parseInt(runtimeMajor);
        const parsedMinor = parseInt(runtimeMinor);
        const parsedPatch = parseInt(runtimePatch);
        return parsedMajor > major || parsedMajor === major 
            && (parsedMinor > minor || parsedMinor === minor && parsedPatch >= patch);
    }
}