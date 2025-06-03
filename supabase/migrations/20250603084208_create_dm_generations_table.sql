-- Create dm_generations table for tracking DM generation history
CREATE TABLE dm_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_handle TEXT NOT NULL,
    goal TEXT NOT NULL,
    generated_dms JSONB NOT NULL,
    target_bio TEXT,
    target_tweets JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_dm_generations_user_id ON dm_generations(user_id);
CREATE INDEX idx_dm_generations_created_at ON dm_generations(created_at);
CREATE INDEX idx_dm_generations_target_handle ON dm_generations(target_handle);

-- Enable Row Level Security (RLS)
ALTER TABLE dm_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own DM generations
CREATE POLICY "Users can view their own DM generations" ON dm_generations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own DM generations
CREATE POLICY "Users can insert their own DM generations" ON dm_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own DM generations
CREATE POLICY "Users can update their own DM generations" ON dm_generations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own DM generations
CREATE POLICY "Users can delete their own DM generations" ON dm_generations
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dm_generations_updated_at
    BEFORE UPDATE ON dm_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
