import { memo, useMemo, useCallback, useState, useEffect } from "react";
import { FixedSizeList as VirtualList } from "react-window";

interface MemoizedListItemProps {
  item: any;
  index: number;
  onClick?: (item: any, index: number) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
}

const MemoizedListItem = memo(({ item, index, onClick, renderItem }: MemoizedListItemProps) => {
  const handleClick = useCallback(() => {
    onClick?.(item, index);
  }, [item, index, onClick]);

  return (
    <div onClick={handleClick}>
      {renderItem(item, index)}
    </div>
  );
});

MemoizedListItem.displayName = "MemoizedListItem";

interface MemoizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onItemClick?: (item: any, index: number) => void;
  className?: string;
  itemHeight?: number;
  maxHeight?: number;
  width?: number;
  virtual?: boolean;
}

export function MemoizedList({ 
  items, 
  renderItem, 
  onItemClick, 
  className, 
  itemHeight = 80,
  maxHeight = 400,
  width = 400,
  virtual = false
}: MemoizedListProps) {
  const memoizedItems = useMemo(() => items, [items]);
  
  const VirtualRowRenderer = useCallback(({ index, style }: any) => (
    <div style={style}>
      <MemoizedListItem
        item={memoizedItems[index]}
        index={index}
        onClick={onItemClick}
        renderItem={renderItem}
      />
    </div>
  ), [memoizedItems, onItemClick, renderItem]);

  // Use virtual scrolling for large lists (>20 items)
  if (virtual && items.length > 20) {
    return (
      <div className={className}>
        <VirtualList
          width={width}
          height={Math.min(maxHeight, items.length * itemHeight)}
          itemCount={items.length}
          itemSize={itemHeight}
        >
          {VirtualRowRenderer}
        </VirtualList>
      </div>
    );
  }

  // Regular rendering with memoization for smaller lists
  return (
    <div className={className}>
      {memoizedItems.map((item, index) => (
        <MemoizedListItem
          key={item.id || index}
          item={item}
          index={index}
          onClick={onItemClick}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}