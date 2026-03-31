
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    type="button"
    className={`flex items-center justify-center h-5 w-5 rounded-full bg-slate-600 text-white hover:bg-brand-primary active:bg-brand-primary-700 shadow-md border border-white/20 transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-100 ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface ListItemProps {
    children: React.ReactNode;
    className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({ children, className }) => {
    return <div className={`relative group ${className}`}>{children}</div>
}

interface EditableListProps<T> {
  items: T[];
  path: string;
  onChange: (path: string, value: T[]) => void;
  newItem: T;
  children?: (item: T, index: number) => React.ReactNode;
  renderItem?: (item: T, index: number) => React.ReactNode;
  className?: string;
}


export function EditableList<T>({ items, path, onChange, newItem, children, renderItem, className }: EditableListProps<T>) {

  const handleAdd = (index: number) => {
    const newItems = [...items];
    let itemToAdd = newItem;
    if (typeof newItem === 'object' && newItem !== null && !Array.isArray(newItem)) {
        itemToAdd = { ...newItem, id: `id-${Date.now()}-${Math.random()}` } as T;
    }
    newItems.splice(index + 1, 0, itemToAdd);
    onChange(path, newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(path, newItems);
  };
  
  const handleMove = (index: number, direction: 'up' | 'down') => {
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === items.length - 1) return;
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(index, 1);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      newItems.splice(newIndex, 0, movedItem);
      onChange(path, newItems);
  }

  const renderer = renderItem || children;
  
  if (!renderer) {
    return null;
  }
  
  const Tag = className?.includes('list-') ? 'ul' : 'div';
  const ItemWrapper = Tag === 'ul' ? motion.li : motion.div;

  return (
    <Tag className={className}>
      <AnimatePresence>
        {(items || []).map((item, index) => {
          if (!item) return null;
          return (
            <ItemWrapper
              key={(item as any).id || index}
              className="relative group"
              layout="position"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderer(item, index)}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" aria-label="Item controls">
                <ControlButton onClick={() => handleAdd(index)} title="Add item below">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </ControlButton>
                <ControlButton onClick={() => handleRemove(index)} title="Remove item">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </ControlButton>
                {index > 0 && (
                    <ControlButton onClick={() => handleMove(index, 'up')} title="Move up">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a1 1 0 01-1-1V5.414l-2.293 2.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                    </ControlButton>
                )}
                {index < items.length - 1 && (
                     <ControlButton onClick={() => handleMove(index, 'down')} title="Move down">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v11.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </ControlButton>
                )}
              </div>
            </ItemWrapper>
          );
        })}
      </AnimatePresence>
    </Tag>
  );
}