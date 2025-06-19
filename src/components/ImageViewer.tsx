'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  isOpen: boolean;
}

export function ImageViewer({ images, initialIndex = 0, onClose, isOpen }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetZoom();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetZoom();
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    resetZoom();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[80vh] p-0 gap-0 bg-black/95 border-gray-800">
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/50 rounded-full p-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white text-sm px-2">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="p-2 rounded-full text-white hover:bg-black/70 transition-colors disabled:opacity-50"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Image container */}
          <div 
            className={cn(
              "relative w-full h-full flex items-center justify-center",
              isDragging ? "cursor-grabbing" : scale > 1 ? "cursor-grab" : "cursor-default"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                pointerEvents: isDragging ? 'none' : 'auto'
              }}
              draggable={false}
              fill={false}
              width={800}
              height={600}
            />
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-black/50 rounded-xl">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  resetZoom();
                }}
                className={cn(
                  "w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                  currentIndex === index ? "border-orange-500" : "border-transparent hover:border-orange-500/50"
                )}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  width={64}
                  height={64}
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 