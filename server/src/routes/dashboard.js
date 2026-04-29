import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';
import { statuses } from '../validation.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('applied_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const applications = data || [];
  const total = applications.length;
  const byStatus = statuses.map((status) => ({
    status,
    count: applications.filter((item) => item.status === status).length,
    percent: total ? Math.round((applications.filter((item) => item.status === status).length / total) * 1000) / 10 : 0
  }));

  const upcoming = applications
    .filter((item) => item.next_step_date)
    .sort((a, b) => new Date(a.next_step_date) - new Date(b.next_step_date))
    .slice(0, 5);

  res.json({
    totals: {
      total,
      inProgress: byStatus.find((item) => item.status === 'In Progress')?.count || 0,
      interviews: byStatus.find((item) => item.status === 'Interview')?.count || 0,
      offers: byStatus.find((item) => item.status === 'Offer')?.count || 0
    },
    byStatus,
    recent: applications.slice(0, 5),
    upcoming
  });
});
