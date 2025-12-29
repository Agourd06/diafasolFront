import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type DropdownMenuItem =
  | {
      divider: true;
      label?: never;
      onClick?: never;
      icon?: never;
      disabled?: never;
    }
  | {
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      disabled?: boolean;
      divider?: false;
    };

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const menuHeight = 300; // Approximate max height
      const menuWidth = 224; // w-56 = 14rem = 224px
      
      // Calculate vertical position
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const showAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      let top: number;
      let maxHeight: number;
      
      if (showAbove) {
        // Show above the button
        top = buttonRect.top - menuHeight;
        maxHeight = Math.min(menuHeight, spaceAbove - 8);
      } else {
        // Show below the button
        top = buttonRect.bottom + 4;
        maxHeight = Math.min(menuHeight, spaceBelow - 8);
      }
      
      // Ensure menu doesn't go below viewport
      if (top + maxHeight > viewportHeight) {
        maxHeight = viewportHeight - top - 8;
      }
      
      // Calculate horizontal position
      let left: number;
      if (align === 'right') {
        left = buttonRect.right - menuWidth;
      } else {
        left = buttonRect.left;
      }
      
      // Ensure menu doesn't go outside viewport
      if (left < 8) {
        left = 8;
      } else if (left + menuWidth > viewportWidth - 8) {
        left = viewportWidth - menuWidth - 8;
      }
      
      setPosition({ top, left, maxHeight: Math.max(200, maxHeight) });
    }
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current?.contains(event.target as Node) ||
        menuRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-[9999] w-56 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxHeight: `${position.maxHeight}px`,
        }}
      >
        <div className="py-1 overflow-y-auto" style={{ maxHeight: `${position.maxHeight}px` }}>
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1 border-t border-slate-200" />;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={`
                  flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors
                  ${item.disabled
                    ? 'cursor-not-allowed text-slate-400'
                    : 'text-slate-700 hover:bg-slate-100'
                  }
                `}
              >
                {item.icon && <span className="text-slate-500 flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {trigger}
      </div>

      {typeof window !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  );
};

export default DropdownMenu;
