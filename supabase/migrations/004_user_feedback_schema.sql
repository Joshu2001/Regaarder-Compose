-- ==============================================================================
-- Regaarder Workspace - Migration 004: User Feedback & Founder Triage System
-- Stores bug reports, feature ideas, improvements, diagnostic context, and screenshots
-- ==============================================================================

-- 1. USER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    type TEXT NOT NULL DEFAULT 'bug', -- 'bug', 'idea', 'improvement', 'other'
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_review', 'resolved', 'archived'
    attachments JSONB DEFAULT '[]'::jsonb,
    workspace_context JSONB DEFAULT '{}'::jsonb,
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy triage queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(type);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
-- Anyone authenticated or unauthenticated guest can insert feedback
CREATE POLICY "Anyone can submit feedback"
    ON public.user_feedback
    FOR INSERT
    WITH CHECK (true);

-- Users can read their own feedback
CREATE POLICY "Users can read their own submitted feedback"
    ON public.user_feedback
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Admin read & update policies (allow read/update by workspace owners / service role)
CREATE POLICY "Full access to feedback for authenticated service role or admin"
    ON public.user_feedback
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id);

-- 4. EMAIL NOTIFICATION HOOK (DATABASE WEBHOOK / HTTP TRIGGER)
-- Optional: If using Supabase Database Webhooks (Dashboard -> Database -> Webhooks):
-- Create a webhook on table 'public.user_feedback' on 'INSERT' pointing to your
-- Resend / Edge Function endpoint to email notifications to founders instantly.
