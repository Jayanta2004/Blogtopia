-- Blogtopia Database Setup
-- Run this in your Supabase SQL Editor

-- Create the blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  thumbnail TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  excerpt TEXT, -- Auto-generated excerpt for better performance
  word_count INTEGER DEFAULT 0, -- For reading time calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_title ON blogs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_blogs_excerpt ON blogs USING gin(to_tsvector('english', excerpt));

-- Disable Row Level Security since no auth is required
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access" ON blogs;
DROP POLICY IF EXISTS "Allow authenticated insert" ON blogs;
DROP POLICY IF EXISTS "Allow authenticated update" ON blogs;
DROP POLICY IF EXISTS "Allow authenticated delete" ON blogs;

-- Create a function to extract excerpt from content
CREATE OR REPLACE FUNCTION extract_excerpt_from_content(content_json JSONB)
RETURNS TEXT AS $$
DECLARE
    row_item JSONB;
    col_item JSONB;
    text_content TEXT := '';
    plain_text TEXT;
BEGIN
    -- Loop through content rows
    FOR row_item IN SELECT jsonb_array_elements(content_json)
    LOOP
        -- Loop through columns in each row
        IF row_item ? 'columns' THEN
            FOR col_item IN SELECT jsonb_array_elements(row_item->'columns')
            LOOP
                -- Extract text from text-based content types
                IF col_item->>'type' IN ('text', 'paragraph', 'heading') THEN
                    plain_text := regexp_replace(col_item->>'value', '<[^>]*>', '', 'g');
                    text_content := text_content || ' ' || plain_text;
                    -- Stop if we have enough text (150 chars)
                    IF length(text_content) > 150 THEN
                        EXIT;
                    END IF;
                END IF;
            END LOOP;
        END IF;
        -- Stop if we have enough text
        IF length(text_content) > 150 THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Clean up and truncate
    text_content := trim(text_content);
    IF length(text_content) > 150 THEN
        text_content := left(text_content, 150) || '...';
    END IF;
    
    RETURN text_content;
END;
$$ LANGUAGE plpgsql;

-- Create a function to count words in content
CREATE OR REPLACE FUNCTION count_words_in_content(content_json JSONB)
RETURNS INTEGER AS $$
DECLARE
    row_item JSONB;
    col_item JSONB;
    text_content TEXT := '';
    plain_text TEXT;
    word_count INTEGER := 0;
BEGIN
    -- Loop through content rows
    FOR row_item IN SELECT jsonb_array_elements(content_json)
    LOOP
        -- Loop through columns in each row
        IF row_item ? 'columns' THEN
            FOR col_item IN SELECT jsonb_array_elements(row_item->'columns')
            LOOP
                -- Extract text from text-based content types
                IF col_item->>'type' IN ('text', 'paragraph', 'heading', 'list', 'quote') THEN
                    plain_text := regexp_replace(col_item->>'value', '<[^>]*>', '', 'g');
                    text_content := text_content || ' ' || plain_text;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    -- Count words (split by whitespace)
    IF length(trim(text_content)) > 0 THEN
        word_count := array_length(string_to_array(trim(text_content), ' '), 1);
    END IF;
    
    RETURN COALESCE(word_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically update excerpt and word count
CREATE OR REPLACE FUNCTION update_blog_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update excerpt
    NEW.excerpt := extract_excerpt_from_content(NEW.content);
    
    -- Update word count
    NEW.word_count := count_words_in_content(NEW.content);
    
    -- Update timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic metadata updates
DROP TRIGGER IF EXISTS update_blog_metadata_trigger ON blogs;
CREATE TRIGGER update_blog_metadata_trigger
    BEFORE INSERT OR UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_metadata();

-- Display success message
SELECT 'Database setup completed successfully! No sample data inserted.' as message;

-- Create blog reactions table
CREATE TABLE IF NOT EXISTS blog_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, reaction_type)
);

-- Create function to add reactions
CREATE OR REPLACE FUNCTION add_reaction(blog_id UUID, reaction_type TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    INSERT INTO blog_reactions (blog_id, reaction_type, count)
    VALUES (blog_id, reaction_type, 1)
    ON CONFLICT (blog_id, reaction_type)
    DO UPDATE SET 
        count = blog_reactions.count + 1,
        updated_at = NOW()
    RETURNING count INTO new_count;
    
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Disable Row Level Security for reactions table
ALTER TABLE blog_reactions DISABLE ROW LEVEL SECURITY;

-- Create index for reactions
CREATE INDEX IF NOT EXISTS idx_blog_reactions_blog_id ON blog_reactions(blog_id);

-- Final success message
SELECT 'Blogtopia database setup completed successfully! Reactions system enabled.' as message;