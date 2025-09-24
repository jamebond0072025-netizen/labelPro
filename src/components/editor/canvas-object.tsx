'use client';

import { CanvasObject as CanvasObjectType, TextObject } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { BarcodeSvg } from './barcode-svg';
import { RotateCcw } from 'lucide-react';

interface CanvasObjectProps {
  object: CanvasObjectType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInteractionStart: (
    e: React.PointerEvent,
    id: string,
    type: 'drag' | 'resize' | 'rotate',
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'rotate' | 'body'
  ) => void;
}

export function CanvasObject({
  object,
  isSelected,
  onSelect,
  onInteractionStart,
}: CanvasObjectProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: object.x,
    top: object.y,
    width: object.width,
    height: object.height,
    transform: `rotate(${object.rotation}deg)`,
    opacity: object.opacity,
    cursor: 'grab',
  };

  const renderObjectContent = () => {
    switch (object.type) {
      case 'text':
        const textStyle: React.CSSProperties = {
          fontSize: object.fontSize,
          fontWeight: object.fontWeight,
          fontFamily: object.fontFamily,
          color: object.color,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        };
        return <div style={textStyle}>{object.text}</div>;
      case 'image':
        return (
          <Image
            src={object.src}
            alt="Canvas image"
            layout="fill"
            objectFit="cover"
            draggable={false}
          />
        );
      case 'barcode':
        return <BarcodeSvg value={object.value} />;
      default:
        return null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent, type: 'drag' | 'resize' | 'rotate', handle: 'nw' | 'ne' | 'sw' | 'se' | 'rotate' | 'body') => {
    e.stopPropagation();
    onInteractionStart(e, object.id, type, handle);
  };

  return (
    <div
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(object.id);
      }}
      onPointerDown={(e) => handlePointerDown(e, 'drag', 'body')}
      className={cn(
        'outline-none',
        isSelected && 'outline-accent outline-dashed outline-1'
      )}
    >
      {renderObjectContent()}
      {isSelected && (
        <>
          {/* Resize Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'nw')} />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'ne')} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'sw')} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'se')} />
          
          {/* Rotate Handle */}
          <div 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 p-1 bg-white border border-accent rounded-full cursor-grab"
            onPointerDown={(e) => handlePointerDown(e, 'rotate', 'rotate')}
          >
            <RotateCcw className="w-3 h-3 text-accent" />
          </div>
        </>
      )}
    </div>
  );
}
