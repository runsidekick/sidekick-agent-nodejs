import ApplicationInfo from "./ApplicationInfo";
import ApplicationInfoProvider from "./ApplicationInfoProvider";

export default class Application {
    static applicationInfoProvider: ApplicationInfoProvider;

    private Application() {
    }

    static getApplicationInfoProvider(): ApplicationInfoProvider {
        return Application.applicationInfoProvider;
    }

    static setApplicationInfoProvider(applicationInfoProvider: ApplicationInfoProvider): void {
        Application.applicationInfoProvider = applicationInfoProvider;
    }

    static getApplicationInfo(): ApplicationInfo {
        if (!Application.applicationInfoProvider) {
            return;
        }

        return Application.applicationInfoProvider.getApplicationInfo();
    }
}