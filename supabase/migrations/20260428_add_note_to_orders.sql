-- 3.7 Entry note field: add nullable note column

ALTER TABLE public.orders
ADD COLUMN note TEXT;
