import type {
    FactoryState,
    Incident,
} from "@/types/factory";

import type { QualityAssessment } from "@/types/quality";

import { buildQualityContext } from "./context-builder";
import { MockQualityProvider } from "./mock-provider";
import type { QualityProvider } from "./types";

export class QualityAgent {
    constructor(private readonly provider: QualityProvider = new MockQualityProvider()) {}

    async assessImpact(incident: Incident, factoryState: FactoryState): Promise<QualityAssessment> {
        const context = buildQualityContext(incident, factoryState);

        return this.provider.assess(context);
    }
}