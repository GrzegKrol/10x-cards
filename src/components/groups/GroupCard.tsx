import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { FlashcardGroupDTO } from "@/types";

interface GroupCardProps {
  group: FlashcardGroupDTO;
}

export default function GroupCard({ group }: GroupCardProps) {
  const lastUpdated = new Date(group.updated_date).toLocaleDateString();
  const cardsCount = group.last_used_cards_count || 0;

  const handleCardClick = () => {
    window.location.href = `/groups/${group.id}`;
  };

  return (
    <Card
      onClick={handleCardClick}
      className="hover:bg-accent/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
      tabIndex={0}
      role="link"
      aria-label={`${group.name} group, last updated ${lastUpdated}, contains ${cardsCount} cards`}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2">{group.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {group.last_used_prompt && (
          <p className="text-sm text-muted-foreground line-clamp-2">Last prompt: {group.last_used_prompt}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 text-sm text-muted-foreground">
        <span className="flex-shrink-0">Updated: {lastUpdated}</span>
        <span className="flex-shrink-0">{cardsCount} cards</span>
      </CardFooter>
    </Card>
  );
}
