import { ApplicationStatus } from "../../types";

export default interface ApplicationStatusProvider {
    provide(applicationStatus: ApplicationStatus, client: string): void;
}