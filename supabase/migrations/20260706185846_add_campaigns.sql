-- Campaigns (World Cup, Best Dressed, etc.)
CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  emoji       TEXT DEFAULT '🎯',
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Options within a campaign (Brazil, Argentina, etc.)
CREATE TABLE campaign_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '🏳️',
  color       TEXT DEFAULT '#888888',
  sort_order  INTEGER DEFAULT 0
);

-- One assignment per person per campaign (upsert on profile_id + campaign_id)
CREATE TABLE campaign_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_id   UUID NOT NULL REFERENCES campaign_options(id) ON DELETE CASCADE,
  voted_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(campaign_id, profile_id)
);

-- Seed: World Cup 2026 campaign
INSERT INTO campaigns (id, name, description, emoji) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'World Cup 2026 🏆', 'Which nation does each person secretly support?', '⚽');

INSERT INTO campaign_options (campaign_id, name, emoji, color, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Brazil',    '🇧🇷', '#009C3B', 1),
  ('c0000000-0000-0000-0000-000000000001', 'Argentina', '🇦🇷', '#75AADB', 2),
  ('c0000000-0000-0000-0000-000000000001', 'England',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '#CF111A', 3),
  ('c0000000-0000-0000-0000-000000000001', 'France',    '🇫🇷', '#002395', 4),
  ('c0000000-0000-0000-0000-000000000001', 'Spain',     '🇪🇸', '#c60b1e', 5),
  ('c0000000-0000-0000-0000-000000000001', 'Germany',   '🇩🇪', '#000000', 6),
  ('c0000000-0000-0000-0000-000000000001', 'Portugal',  '🇵🇹', '#006600', 7),
  ('c0000000-0000-0000-0000-000000000001', 'Pakistan',  '🇵🇰', '#01411C', 8),
  ('c0000000-0000-0000-0000-000000000001', 'India',     '🇮🇳', '#FF9933', 9),
  ('c0000000-0000-0000-0000-000000000001', 'Morocco',   '🇲🇦', '#C1272D', 10);
