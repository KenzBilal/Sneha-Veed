import type { Tag } from '@/lib/db';

const colorMap: Record<string, string> = {
  green: 'tag tag-green',
  red:   'tag tag-red',
  wood:  'tag tag-wood',
  sun:   'tag tag-sun',
  gray:  'tag tag-gray',
};

export default function TagBadge({ tag }: { tag: Tag }) {
  return (
    <span className={colorMap[tag.color] || 'tag tag-gray'}>
      {tag.emoji} {tag.label}
    </span>
  );
}
