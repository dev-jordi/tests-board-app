CREATE TABLE public.bugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'reported',
  color TEXT NOT NULL DEFAULT 'spray-lime',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bugs" ON public.bugs FOR SELECT USING (true);
CREATE POLICY "Anyone can create bugs" ON public.bugs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bugs" ON public.bugs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bugs" ON public.bugs FOR DELETE USING (true);

CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.bugs;