-- ==============================================================================
-- Regaarder Workspace - Migration 003: Comprehensive Backup & Remaining Modules
-- Decks, Whiteboards, Memora Knowledge Graph, Presets, and Universal Backups
-- ==============================================================================

-- 1. DECKS & PRESENTATIONS
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Deck',
    slides JSONB NOT NULL DEFAULT '[]'::jsonb,
    theme JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. WHITEBOARDS & SPATIAL TOPOLOGY
CREATE TABLE IF NOT EXISTS public.whiteboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Whiteboard',
    topology JSONB NOT NULL DEFAULT '{}'::jsonb,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    viewport JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MEMORA KNOWLEDGE GRAPH & DECISION INDEX
CREATE TABLE IF NOT EXISTS public.knowledge_graphs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    decision_index JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. WORKSPACE PRESETS, BRAND RULES & PERSONAS
CREATE TABLE IF NOT EXISTS public.workspace_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_rules JSONB DEFAULT '{}'::jsonb,
    raw_brand_markdown TEXT DEFAULT '',
    personas JSONB DEFAULT '[]'::jsonb,
    templates JSONB DEFAULT '[]'::jsonb,
    dropdown_presets JSONB DEFAULT '[]'::jsonb,
    dashboard_presets JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. UNIVERSAL WORKSPACE BACKUPS & POINT-IN-TIME SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.workspace_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Manual Backup',
    version TEXT DEFAULT '1.0.0',
    snapshot JSONB NOT NULL, -- Complete point-in-time state of all workspace modules
    item_counts JSONB DEFAULT '{}'::jsonb,
    byte_size BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_backups ENABLE ROW LEVEL SECURITY;

-- 7. POLICIES
CREATE POLICY "Users can manage decks" ON public.decks FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage whiteboards" ON public.whiteboards FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage knowledge graphs" ON public.knowledge_graphs FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage presets" ON public.workspace_presets FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage backups" ON public.workspace_backups FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 8. TRIGGERS
CREATE TRIGGER set_decks_timestamp BEFORE UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_whiteboards_timestamp BEFORE UPDATE ON public.whiteboards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_knowledge_graphs_timestamp BEFORE UPDATE ON public.knowledge_graphs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_workspace_presets_timestamp BEFORE UPDATE ON public.workspace_presets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
