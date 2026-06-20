-- Daily free-listing limit (3 per day) — enforced at the database level so it
-- cannot be bypassed by the client (listings are inserted directly from the
-- browser). PRO accounts (profiles.is_pro = true) are exempt / unlimited.
--
-- The client (app/post-ad/page.tsx) shows a friendly "limit reached" message
-- with an upgrade-to-PRO call to action; this trigger is the hard backstop.
-- On rejection it raises an exception whose message contains DAILY_LISTING_LIMIT,
-- which the client detects to show the same friendly message.

create or replace function enforce_daily_listing_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  is_pro_account boolean;
  todays_count integer;
begin
  -- PRO accounts have no daily limit.
  select coalesce(p.is_pro, false) into is_pro_account
  from profiles p
  where p.id = new.user_id;

  if coalesce(is_pro_account, false) then
    return new;
  end if;

  -- Count listings already created today by this user (server-day, UTC).
  select count(*) into todays_count
  from listings
  where user_id = new.user_id
    and created_at >= date_trunc('day', now());

  if todays_count >= 3 then
    raise exception 'DAILY_LISTING_LIMIT: free accounts may publish at most 3 listings per day';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_daily_listing_limit on listings;

create trigger trg_daily_listing_limit
  before insert on listings
  for each row
  execute function enforce_daily_listing_limit();
