-- 1v1 Battle Questions
CREATE TABLE battle_questions (
  id    TEXT PRIMARY KEY,  -- manual string IDs so we can map them to tags easily in code
  text  TEXT NOT NULL,
  emoji TEXT DEFAULT '⚔️'
);

-- 1v1 Battle Results
CREATE TABLE battle_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES battle_questions(id) ON DELETE CASCADE,
  winner_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  loser_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast counts
CREATE INDEX idx_battle_results_winner ON battle_results(question_id, winner_id);
CREATE INDEX idx_battle_results_loser ON battle_results(question_id, loser_id);

-- Seed some core questions
INSERT INTO battle_questions (id, text, emoji) VALUES
  ('q_fight', 'Who would win in a street fight?', '🥊'),
  ('q_fashion', 'Who has the best fashion sense?', '👔'),
  ('q_broke', 'Who is most likely to go broke first?', '💸'),
  ('q_jail', 'Who is most likely to get arrested?', '🚓'),
  ('q_survive', 'Who survives a zombie apocalypse longest?', '🧟‍♂️'),
  ('q_smart', 'Who is actually the smartest?', '🧠'),
  ('q_funny', 'Who is naturally funnier?', '😂'),
  ('q_late', 'Who is always late to everything?', '⏰'),
  ('q_secret', 'Who is hiding the most secrets?', '🥷'),
  ('q_cry', 'Who cries at movies the most?', '😭');
