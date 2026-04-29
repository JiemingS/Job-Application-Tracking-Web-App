import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';
import { applicationSchema, statuses, validate } from '../validation.js';

export const applicationsRouter = Router();

applicationsRouter.get('/', async (req, res) => {
  const { status, search } = req.query;
  let query = supabaseAdmin
    .from('applications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('applied_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (status && statuses.includes(status)) query = query.eq('status', status);
  if (search) query = query.or(`company.ilike.%${search}%,position.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

applicationsRouter.post('/', async (req, res) => {
  const { data: payload, error: validationError } = validate(applicationSchema, req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .insert({ ...payload, user_id: req.user.id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

applicationsRouter.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Application not found.' });
  res.json(data);
});

applicationsRouter.put('/:id', async (req, res) => {
  const { data: payload, error: validationError } = validate(applicationSchema.partial(), req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Application not found.' });
  res.json(data);
});

applicationsRouter.delete('/:id', async (req, res) => {
  const { error, count } = await supabaseAdmin
    .from('applications')
    .delete({ count: 'exact' })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  if (!count) return res.status(404).json({ error: 'Application not found.' });
  res.status(204).send();
});
