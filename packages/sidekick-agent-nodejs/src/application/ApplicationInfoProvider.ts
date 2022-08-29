import ApplicationInfo from "./ApplicationInfo";

export default abstract class ApplicationInfoProvider {
    static APPLICATION_RUNTIME = 'nodejs';

    abstract getApplicationInfo(): ApplicationInfo;
}