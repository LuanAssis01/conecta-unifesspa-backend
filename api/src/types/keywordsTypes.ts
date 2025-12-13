export type Keyword =           {
    id: string;
        name: string;
    }

export type KeywordWithProjects = Keyword & {
    project: {
        id: string;
        name: string;
        status: string;
    }[];
}

export type CreateKeywordsInput =   {
    keywords: string[];
}

export type ProjectIdParam = {
    projectId: string;
}

export type KeywordIdParam = {
    keywordId: string;
}

export type ProjectKeywordParams = {
    projectId: string;
    keywordId: string;
}