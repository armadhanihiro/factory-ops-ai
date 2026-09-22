import type {
    FactoryState,
    Incident,
} from "@/types/factory";

import type { QualityAssessment } from "@/types/quality";

import { buildQualityContext } from "./context-builder";
import { createQualityProvider } from "./provider";
import type { QualityProvider } from "./types";

export class QualityAgent {
    constructor(private readonly provider: QualityProvider = createQualityProvider()) {}

    async assessImpact(incident: Incident, factoryState: FactoryState): Promise<QualityAssessment> {
        const context = buildQualityContext(incident, factoryState);

        return this.provider.assess(context);
    }
}