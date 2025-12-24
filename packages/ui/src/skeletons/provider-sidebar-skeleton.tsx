import { Skeleton } from '../skeleton';

interface ProviderSidebarSkeletonProps {
  count?: number;
}

function ProviderSidebarSkeleton({ count = 8 }: ProviderSidebarSkeletonProps) {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-1.5 rounded-md">
          <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

export { ProviderSidebarSkeleton };
