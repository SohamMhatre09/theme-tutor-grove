import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full h-full"
    >
      <ResizablePanel 
        defaultSize={defaultLeftWidth} 
        minSize={minLeftWidth}
        className="bg-background overflow-auto"
      >
        {leftContent}
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel 
        defaultSize={100 - defaultLeftWidth - defaultRightWidth} 
        minSize={minCenterWidth}
        className="bg-background overflow-auto"
      >
        {centerContent}
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel 
        defaultSize={defaultRightWidth} 
        minSize={minRightWidth}
        className="bg-background overflow-auto border-l border-border"
      >
        {rightContent}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}