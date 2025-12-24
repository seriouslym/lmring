import { Card } from '../card';
import { Skeleton } from '../skeleton';

interface ProviderCardSkeletonProps {
  count?: number;
}

function ProviderCardSkeleton({ count = 6 }: ProviderCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="h-full flex flex-col">
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex-1 mb-2 space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="pt-3 border-t flex justify-end">
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

export { ProviderCardSkeleton };
