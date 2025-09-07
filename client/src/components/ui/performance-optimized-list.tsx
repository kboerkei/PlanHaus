import { memo, useMemo, useCallback, Suspense, lazy } from "react";
import { MemoizedList } from "./memoized-list";

// Lazy load heavy components
const LazyMoodBoard = lazy(() => import("@/components/shared/mood-board"));
const LazyResponsiveDataTable = lazy(() => import("@/components/shared/responsive-data-table"));

interface OptimizedListProps {
  items: any[];
  renderType: 'card' | 'table' | 'moodboard';
  onItemClick?: (item: any) => void;
  className?: string;
}

// Memoized list item renderers
const CardRenderer = memo(({ item, index }: any) => (
  <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
    <h3 className="font-medium">{item.name || item.title}</h3>
    {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
    {item.status && (
      <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
        item.status === 'completed' ? 'bg-green-100 text-green-800' :
        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {item.status}
      </span>
    )}
  </div>
));

CardRenderer.displayName = "CardRenderer";

const ListSkeleton = memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
));

ListSkeleton.displayName = "ListSkeleton";

export const PerformanceOptimizedList = memo(({ 
  items, 
  renderType, 
  onItemClick, 
  className 
}: OptimizedListProps) => {
  const optimizedItems = useMemo(() => items, [items]);

  const renderItem = useCallback((item: any, index: number) => {
    switch (renderType) {
      case 'card':
        return <CardRenderer item={item} index={index} />;
      case 'table':
        return (
          <tr key={item.id || index} className="border-b">
            <td className="px-4 py-2">{item.name || item.title}</td>
            <td className="px-4 py-2 text-gray-600">{item.status}</td>
            <td className="px-4 py-2 text-gray-600">{item.category}</td>
          </tr>
        );
      case 'moodboard':
        return (
          <div className="relative group">
            <img 
              src={item.imageUrl || '/placeholder-image.jpg'} 
              alt={item.title}
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-lg shadow-sm"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-medium">{item.title}</h3>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [renderType]);

  if (!optimizedItems?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items to display</p>
      </div>
    );
  }

  if (renderType === 'table') {
    return (
      <div className={className}>
        <table className="w-full">
          <thead>
            <tr className="border-b font-medium text-gray-700">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Category</th>
            </tr>
          </thead>
          <tbody>
            <MemoizedList
              items={optimizedItems}
              renderItem={renderItem}
              onItemClick={onItemClick}
              virtual={optimizedItems.length > 50}
            />
          </tbody>
        </table>
      </div>
    );
  }

  if (renderType === 'moodboard') {
    return (
      <Suspense fallback={<ListSkeleton />}>
        <LazyMoodBoard items={optimizedItems} />
      </Suspense>
    );
  }

  return (
    <MemoizedList
      items={optimizedItems}
      renderItem={renderItem}
      onItemClick={onItemClick}
      className={className}
      virtual={optimizedItems.length > 20}
    />
  );
});

PerformanceOptimizedList.displayName = "PerformanceOptimizedList";