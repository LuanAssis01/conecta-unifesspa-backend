export type Course = {
    id: string;
    name: string;
}

export type CourseWithProjects = Course & {
    projects: {
        id: string;
        name: string;
        status: string;
    }[];
}

export type CreateCourseInput = {
    name: string;
}

export type UpdateCourseInput = {
    name?: string;
}

export type CourseIdParam = {
    id: string;
}
