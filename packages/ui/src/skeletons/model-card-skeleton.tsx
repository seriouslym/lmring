import { Card, CardContent, CardHeader } from '../card';
import { Skeleton } from '../skeleton';

interface ModelCardSkeletonProps {
  count?: number;
}

function ModelCardSkeleton({ count = 2 }: ModelCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-full min-h-0 min-w-0 overflow-hidden">
          <Card className="h-full min-h-0 arena-card flex flex-col glass-effect relative overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0 space-y-0">
              <div className="flex items-center gap-2">
                {/* Model selector button skeleton */}
                <div className="relative flex-1 min-w-0">
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>

                {/* Toolbar buttons skeleton */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-0 overflow-hidden pb-4">
              {/* Model info card skeleton (empty state) */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3 max-w-xl w-full backdrop-blur-sm">
                  {/* Provider icon + name */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>

                  {/* Context/Pricing info */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>

                  {/* Footer link */}
                  <div className="pt-3 border-t">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </>
  );
}

export { ModelCardSkeleton };
