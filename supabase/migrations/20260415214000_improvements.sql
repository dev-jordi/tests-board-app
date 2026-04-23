CREATE TABLE public.improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'planned', 'done')),
  color TEXT NOT NULL DEFAULT 'spray-lime',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view improvements" ON public.improvements FOR SELECT USING (true);
CREATE POLICY "Anyone can create improvements" ON public.improvements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update improvements" ON public.improvements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete improvements" ON public.improvements FOR DELETE USING (true);

CREATE TRIGGER update_improvements_updated_at
  BEFORE UPDATE ON public.improvements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.improvements;
