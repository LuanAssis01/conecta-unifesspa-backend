export type ImpactIndicator = {
    id: string;
    title: string;
    value: number;
    projectId: string | null;
}

export type ImpactIndicatorWithProject = ImpactIndicator & {
    project: {
        id: string;
        name: string;
        creatorId: string;
    } | null;
}

export type CreateIndicatorInput = {
    title: string;
    value: number;
}

export type CreateIndicatorsInput = {
    indicators: CreateIndicatorInput[];
}

export type UpdateIndicatorInput = {
    title?: string;
    value?: number;
}

export type ProjectIdParam = {
    projectId: string;
}

export type IndicatorIdParam = {
    indicatorId: string;
}