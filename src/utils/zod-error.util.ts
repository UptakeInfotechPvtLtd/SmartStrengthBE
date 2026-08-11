import { ZodError } from 'zod';

export const formatZodErrors = (error: ZodError) => {
    const formattedErrors: Record<string, string> = {};

    error.issues.forEach((issue) => {
        const field = issue.path.join('.') || 'body';
        if (!formattedErrors[field]) {
            formattedErrors[field] = issue.message;
        }
    });

    return formattedErrors;
};
