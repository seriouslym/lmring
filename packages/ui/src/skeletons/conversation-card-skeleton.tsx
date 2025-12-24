import { Card, CardContent, CardHeader } from '../card';
import { Skeleton } from '../skeleton';

interface ConversationCardSkeletonProps {
  count?: number;
}

function ConversationCardSkeleton({ count = 5 }: ConversationCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="cursor-default">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export { ConversationCardSkeleton };
