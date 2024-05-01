import Z from 'zod';

export const projectTypes = ['json', 'markdown', 'yaml', 'xcode', 'yaml-root-key'] as const;

export const projectTypeSchema = Z.enum(projectTypes);