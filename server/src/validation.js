import { z } from 'zod';

export const statuses = ['Applied', 'In Progress', 'Interview', 'Offer', 'Rejected'];

export const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company is required.'),
  position: z.string().trim().min(1, 'Position is required.'),
  status: z.enum(statuses),
  applied_date: z.string().date().nullable().optional(),
  next_step_title: z.string().trim().nullable().optional(),
  next_step_date: z.string().datetime({ offset: true }).nullable().optional(),
  notes: z.string().trim().nullable().optional()
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required.'),
  avatar_url: z.string().url().nullable().optional()
});

export function validate(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      error: result.error.issues.map((issue) => issue.message).join(' ')
    };
  }

  return { data: result.data, error: null };
}
