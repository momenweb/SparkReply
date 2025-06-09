-- Create post_generations table
CREATE TABLE IF NOT EXISTS post_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  tone TEXT,
  goal TEXT,
  writing_style_handle TEXT,
  variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  mimic_user_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_generations_user_id ON post_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_post_generations_created_at ON post_generations(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE post_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own post generations" ON post_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post generations" ON post_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post generations" ON post_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post generations" ON post_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_generations_updated_at 
  BEFORE UPDATE ON post_generations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 