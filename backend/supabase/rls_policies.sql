-- =========================================================
-- ROW LEVEL SECURITY
-- Run after schema.sql. The Flask backend uses the service-role
-- key (which bypasses RLS) but always filters by the verified
-- user_id manually - these policies are the safety net for any
-- direct client access (e.g. Supabase client-side SDK usage) and
-- for defense in depth.
-- =========================================================

alter table profiles enable row level security;
alter table projects enable row level security;
alter table processing_requests enable row level security;
alter table results enable row level security;
alter table activity_logs enable row level security;

-- ---------- profiles ----------
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ---------- projects ----------
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- ---------- processing_requests ----------
create policy "Users can view their own processing requests"
  on processing_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own processing requests"
  on processing_requests for insert
  with check (auth.uid() = user_id);

-- ---------- results ----------
-- Results are linked via processing_requests.user_id, not a direct
-- user_id column, so we check ownership through the parent request.
create policy "Users can view results for their own requests"
  on results for select
  using (
    exists (
      select 1 from processing_requests pr
      where pr.id = results.request_id
        and pr.user_id = auth.uid()
    )
  );

create policy "Users can delete results for their own requests"
  on results for delete
  using (
    exists (
      select 1 from processing_requests pr
      where pr.id = results.request_id
        and pr.user_id = auth.uid()
    )
  );

-- ---------- activity_logs ----------
create policy "Users can view their own activity"
  on activity_logs for select
  using (auth.uid() = user_id);

-- =========================================================
-- STORAGE POLICIES
-- Buckets: uploads, user-files, generated-results, reports
-- Convention: object path is "{user_id}/{filename}"
-- =========================================================

create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id in ('uploads', 'user-files', 'generated-results', 'reports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own files"
  on storage.objects for select
  using (
    bucket_id in ('uploads', 'user-files', 'generated-results', 'reports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id in ('uploads', 'user-files', 'generated-results', 'reports')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
