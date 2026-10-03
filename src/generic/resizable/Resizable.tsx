import { useWindowSize } from '@openedx/paragon';
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

const MIN_WIDTH = 280; // px. The drag handle can shrink to this and grow from here.
const DEFAULT_WIDTH = 360;
const MAX_WIDTH = 480; // px. Wider than this crowds the outline column.
// Keep at least this much of the outline row for the course content.
const RESERVED_ROW = 320;

const limitToRow = (
  box: HTMLElement | null,
  next: number,
  min: number,
  hardMax: number,
) => {
  let cap = hardMax;
  const row = box?.closest('.d-flex.align-items-start') as HTMLElement | null;
  if (row) {
    const sidebar = box.closest('.sidebar') as HTMLElement | null;
    const toggle = sidebar?.querySelector('.sidebar-toggle');
    const toggleWidth = toggle?.getBoundingClientRect().width ?? 0;
    const sidebarStyles = sidebar ? getComputedStyle(sidebar) : null;
    const margin = sidebarStyles
      ? (parseFloat(sidebarStyles.marginLeft) || 0) + (parseFloat(sidebarStyles.marginRight) || 0)
      : 0;
    const gap = parseFloat(getComputedStyle(row).columnGap || '0') || 0;
    const room = row.clientWidth - RESERVED_ROW - toggleWidth - margin - gap;
    cap = Math.min(cap, room);
  }
  return Math.min(Math.max(next, min), Math.max(cap, min));
};

interface ResizableBoxProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Creates a resizable box that can be dragged to resize the width from the left side.
 */
export const ResizableBox = ({
  children,
  minWidth = MIN_WIDTH,
  maxWidth,
}: ResizableBoxProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(Math.max(minWidth, DEFAULT_WIDTH));
  const { width: windowWidth } = useWindowSize();
  const hardMax = maxWidth ?? MAX_WIDTH;

  // Store the start values while dragging
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - startXRef.current; // positive = mouse moved right
    setWidth(limitToRow(boxRef.current, startWidthRef.current - dx, minWidth, hardMax));
  }, [hardMax, minWidth]);

  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  useEffect(() => {
    setWidth((current) => limitToRow(boxRef.current, current, minWidth, hardMax));
  }, [windowWidth, minWidth, hardMax]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // prevent text selection
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    // Attach listeners to the whole document so dragging works even outside the box
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [width, onMouseMove, onMouseUp]);

  return (
    <div
      className="resizable align-self-stretch d-flex"
      ref={boxRef}
      style={{ width: `${width}px` }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-static-element-interactions */}
      <div className="resizable-handle" onMouseDown={onMouseDown} />
      <div className="w-100 d-flex">
        {children}
      </div>
    </div>
  );
};
