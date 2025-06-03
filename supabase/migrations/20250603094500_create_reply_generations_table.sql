-- Create reply_generations table for tracking reply generation history
CREATE TABLE reply_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tweet_id TEXT NOT NULL,
    tweet_url TEXT NOT NULL,
    original_tweet TEXT NOT NULL,
    author_username TEXT NOT NULL,
    author_name TEXT NOT NULL,
    goal TEXT,
    context TEXT,
    generated_replies JSONB NOT NULL,
    tweet_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_reply_generations_user_id ON reply_generations(user_id);
CREATE INDEX idx_reply_generations_created_at ON reply_generations(created_at);
CREATE INDEX idx_reply_generations_tweet_id ON reply_generations(tweet_id);
CREATE INDEX idx_reply_generations_author_username ON reply_generations(author_username);

-- Enable Row Level Security (RLS)
ALTER TABLE reply_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own reply generations
CREATE POLICY "Users can view their own reply generations" ON reply_generations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own reply generations
CREATE POLICY "Users can insert their own reply generations" ON reply_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own reply generations
CREATE POLICY "Users can update their own reply generations" ON reply_generations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own reply generations
CREATE POLICY "Users can delete their own reply generations" ON reply_generations
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reply_generations_updated_at
    BEFORE UPDATE ON reply_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 