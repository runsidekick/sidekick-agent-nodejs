export default class ApplicationInfo {
    applicationId: string;
    applicationInstanceId: string;
    applicationName: string;
    applicationVersion: string;
    applicationStage: string;
    applicationRuntime: string;
    hostname: string;
    applicationRuntimeVersion: string;
    applicationTags: { [key: string]: any };

    constructor(
        applicationId: string,
        applicationInstanceId: string,
        applicationName: string,
        applicationVersion: string,
        applicationStage: string,
        applicationRuntime: string,
        hostname: string,
        applicationRuntimeVersion?: string,
        applicationTags?: { [key: string]: any },
    ) {
        this.applicationId = applicationId;
        this.applicationInstanceId = applicationInstanceId;
        this.applicationName = applicationName;
        this.applicationVersion = applicationVersion;
        this.applicationStage = applicationStage;
        this.applicationRuntime = applicationRuntime;
        this.hostname = hostname;
        this.applicationRuntimeVersion = applicationRuntimeVersion;
        this.applicationTags = applicationTags;
    }
}