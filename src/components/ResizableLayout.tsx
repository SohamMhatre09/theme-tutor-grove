import React, { useState, useRef, useEffect } from 'react';

interface ResizableLayoutProps {
  leftContent: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent: React.ReactNode;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
  minLeftWidth?: number;
  minCenterWidth?: number;
  minRightWidth?: number;
}

export function ResizableLayout({
  leftContent,
  centerContent,
  rightContent,
  defaultLeftWidth = 25,
  defaultRightWidth = 30,
  minLeftWidth = 5,
  minCenterWidth = 10,
  minRightWidth = 5,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftDragRef = useRef<HTMLDivElement>(null);
  const rightDragRef = useRef<HTMLDivElement>(null);
  
  // Handle left panel resizing
  const handleLeftResize = (e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const mouseX = e.clientX;
    const containerRect = containerRef.current.getBoundingClientRect();
    const leftEdge = containerRect.left;
    
    const newLeftWidth = Math.max(minLeftWidth, Math.min(100 - minCenterWidth - rightWidth, (mouseX - leftEdge) / containerWidth * 100));
    setLeftWidth(newLeftWidth);
  };
  
  // Handle right panel resizing
  const handleRightResize = (e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const mouseX = e.clientX;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rightEdge = containerRect.right;
    
    const newRightWidth = Math.max(minRightWidth, Math.min(100 - minCenterWidth - leftWidth, (rightEdge - mouseX) / containerWidth * 100));
    setRightWidth(newRightWidth);
  };
  
  // Set up event listeners for dragging
  useEffect(() => {
    const leftDragger = leftDragRef.current;
    const rightDragger = rightDragRef.current;
    
    const startLeftDrag = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleLeftResize);
      document.addEventListener('mouseup', stopLeftDrag);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const stopLeftDrag = () => {
      document.removeEventListener('mousemove', handleLeftResize);
      document.removeEventListener('mouseup', stopLeftDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    const startRightDrag = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleRightResize);
      document.addEventListener('mouseup', stopRightDrag);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const stopRightDrag = () => {
      document.removeEventListener('mousemove', handleRightResize);
      document.removeEventListener('mouseup', stopRightDrag);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    leftDragger?.addEventListener('mousedown', startLeftDrag as EventListener);
    rightDragger?.addEventListener('mousedown', startRightDrag as EventListener);
    
    const handleLeftDoubleClick = () => {
      setLeftWidth(defaultLeftWidth);
    };
    
    const handleRightDoubleClick = () => {
      setRightWidth(defaultRightWidth);
    };
    
    leftDragger?.addEventListener('dblclick', handleLeftDoubleClick);
    rightDragger?.addEventListener('dblclick', handleRightDoubleClick);
    
    return () => {
      leftDragger?.removeEventListener('mousedown', startLeftDrag as EventListener);
      rightDragger?.removeEventListener('mousedown', startRightDrag as EventListener);
      leftDragger?.removeEventListener('dblclick', handleLeftDoubleClick);
      rightDragger?.removeEventListener('dblclick', handleRightDoubleClick);
      document.removeEventListener('mousemove', handleLeftResize);
      document.removeEventListener('mouseup', stopLeftDrag);
      document.removeEventListener('mousemove', handleRightResize);
      document.removeEventListener('mouseup', stopRightDrag);
    };
  }, [leftWidth, rightWidth, defaultLeftWidth, defaultRightWidth]);
  
  // Calculate center width
  const centerWidth = 100 - leftWidth - rightWidth;
  
  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      {/* Left Panel */}
      <div 
        className="bg-background border-r border-border h-full overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {leftContent}
      </div>
      
      {/* Left Resize Handle */}
      <div 
        ref={leftDragRef}
        className="w-3 bg-border hover:bg-primary absolute h-full cursor-col-resize z-10 transition-colors"
        style={{ left: `${leftWidth}%`, transform: 'translateX(-50%)' }}
        title="Double-click to reset"
      />
      
      {/* Center Panel */}
      <div 
        className="bg-background h-full overflow-hidden"
        style={{ width: `${centerWidth}%` }}
      >
        {centerContent}
      </div>
      
      {/* Right Resize Handle */}
      <div 
        ref={rightDragRef}
        className="w-3 bg-border hover:bg-primary absolute h-full cursor-col-resize z-10 transition-colors"
        style={{ left: `${100 - rightWidth}%`, transform: 'translateX(-50%)' }}
        title="Double-click to reset"
      />
      
      {/* Right Panel */}
      <div 
        className="bg-background border-l border-border h-full overflow-hidden"
        style={{ width: `${rightWidth}%` }}
      >
        {rightContent}
      </div>
    </div>
  );
} 