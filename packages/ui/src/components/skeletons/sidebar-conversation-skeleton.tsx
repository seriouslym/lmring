import { Skeleton } from '../skeleton';

interface SidebarConversationSkeletonProps {
  count?: number;
}

function SidebarConversationSkeleton({ count = 5 }: SidebarConversationSkeletonProps) {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-md">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

export { SidebarConversationSkeleton };
export type { SidebarConversationSkeletonProps };
