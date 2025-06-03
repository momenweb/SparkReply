-- Create thread_generations table
CREATE TABLE IF NOT EXISTS thread_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    tone TEXT,
    target_audience TEXT,
    handle_to_mimic TEXT,
    generated_thread JSONB NOT NULL,
    mimic_user_info JSONB,
    mimic_tweets_sample JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thread_generations_user_id ON thread_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_generations_created_at ON thread_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_thread_generations_topic ON thread_generations USING gin(to_tsvector('english', topic));

-- Enable RLS (Row Level Security)
ALTER TABLE thread_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own thread generations" ON thread_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thread generations" ON thread_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thread generations" ON thread_generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thread generations" ON thread_generations
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_thread_generations_updated_at 
    BEFORE UPDATE ON thread_generations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 