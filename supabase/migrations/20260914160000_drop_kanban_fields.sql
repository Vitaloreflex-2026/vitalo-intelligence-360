--
-- The deal Kanban is replaced by a plain list, so the board's own columns go
-- with it (stage, amount, index) along with the deal name: a deal is now
-- identified by its company and its reference.
--
-- No view references these columns, so none has to be recreated here.
--

alter table public.deals drop column if exists name;
alter table public.deals drop column if exists stage;
alter table public.deals drop column if exists amount;
alter table public.deals drop column if exists index;
