-- 1. Drop existing view if it exists, then create a new one
DROP VIEW IF EXISTS contestant_vote_counts;

CREATE VIEW contestant_vote_counts AS
SELECT 
  c.id,
  c.name::character varying as name,
  c.registration_code::character varying as registration_code,
  c.creative_field::character varying as creative_field,
  COALESCE(SUM(v.vote_count), 0) as total_votes,
  COALESCE(SUM(v.amount_paid), 0) as total_amount_raised
FROM contestants c
LEFT JOIN votes v ON c.id = v.contestant_id 
WHERE v.validation_status = 'verified' OR v.validation_status IS NULL
GROUP BY c.id, c.name, c.registration_code, c.creative_field
ORDER BY total_votes DESC;

-- 2. Drop existing function if it exists
DROP FUNCTION IF EXISTS get_voting_stats();

CREATE FUNCTION get_voting_stats()
RETURNS TABLE (
  total_votes bigint,
  total_amount bigint,
  unique_voters bigint,
  top_contestant_name text,
  top_contestant_votes bigint
) 
LANGUAGE sql
AS $$
  WITH stats AS (
    SELECT 
      COALESCE(SUM(vote_count), 0) as total_votes,
      COALESCE(SUM(amount_paid), 0) as total_amount,
      COUNT(DISTINCT voter_email) as unique_voters
    FROM votes 
    WHERE validation_status = 'verified'
  ),
  top_contestant AS (
    SELECT 
      c.name::character varying as name,
      COALESCE(SUM(v.vote_count), 0) as votes
    FROM contestants c
    LEFT JOIN votes v ON c.id = v.contestant_id AND v.validation_status = 'verified'
    GROUP BY c.id, c.name
    ORDER BY votes DESC
    LIMIT 1
  )
  SELECT 
    s.total_votes,
    s.total_amount,
    s.unique_voters,
    tc.name::text as top_contestant_name,
    tc.votes as top_contestant_votes
  FROM stats s
  CROSS JOIN top_contestant tc;
$$;

-- 3. Grant permissions
GRANT SELECT ON contestant_vote_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_voting_stats() TO anon, authenticated;
