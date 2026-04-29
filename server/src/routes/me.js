import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';
import { profileSchema, validate } from '../validation.js';

export const meRouter = Router();

meRouter.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    user: {
      id: req.user.id,
      email: req.user.email
    },
    profile: data || {
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.user_metadata?.full_name || ''
    }
  });
});

meRouter.put('/', async (req, res) => {
  const { data: payload, error: validationError } = validate(profileSchema, req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: req.user.id,
      email: req.user.email,
      ...payload
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
