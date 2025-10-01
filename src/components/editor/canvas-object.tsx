

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CanvasObject as CanvasObjectType, TextObject, BarcodeObject as BarcodeObjectType, ImageObject as ImageObjectType, QRCodeObject } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { RotateCcw, QrCode, Copy } from 'lucide-react';
import type { InteractionType, InteractionHandle } from '@/hooks/use-editor-interactions';

interface CanvasObjectProps {
  object: CanvasObjectType;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string | null) => void;
  onInteractionStart: (
    e: React.PointerEvent,
    id: string | null,
    type: InteractionType,
    handle: InteractionHandle
  ) => void;
  onDoubleClick: (id: string) => void;
  onUpdate: (id: string, newProps: Partial<CanvasObjectType>) => void;
  onStopEditing: () => void;
  onDuplicate: (id: string) => void;
  zoom: number;
}

const getQRCodeValue = (object: QRCodeObject): string => {
    if (object.key) return object.value || '';
    
    switch (object.qrCodeType) {
        case 'url':
            return object.value || '';
        case 'phone':
            return `tel:${object.phone || ''}`;
        case 'email':
            const subject = object.subject ? `?subject=${encodeURIComponent(object.subject)}` : '';
            const body = object.body ? `${subject ? '&' : '?'}body=${encodeURIComponent(object.body)}` : '';
            return `mailto:${object.email || ''}${subject}${body}`;
        case 'whatsapp':
            const message = object.message ? `?text=${encodeURIComponent(object.message)}` : '';
            return `https://wa.me/${object.phone || ''}${message}`;
        case 'location':
            return `geo:${object.latitude || 0},${object.longitude || 0}`;
        case 'text':
        default:
            return object.value || '';
    }
}

export function CanvasObject({
  object,
  isSelected,
  isEditing,
  onSelect,
  onInteractionStart,
  onDoubleClick,
  onUpdate,
  onStopEditing,
  onDuplicate,
  zoom,
}: CanvasObjectProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');


  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (object.type === 'barcode' && barcodeRef.current) {
      const barcodeObject = object as BarcodeObjectType;
      try {
        JsBarcode(barcodeRef.current, barcodeObject.value, {
            width: 2,
            height: object.height - 20,
            displayValue: true,
            background: "#FFFFFF",
            margin: 10,
        });
      } catch (e) {
        console.error('Invalid barcode value', e);
      }
    }
  }, [object, object.width, object.height, object.value]);

  useEffect(() => {
    if (object.type === 'qrcode') {
        const qrObject = object as QRCodeObject;
        const qrValue = getQRCodeValue(qrObject);
        if (qrValue) {
             QRCode.toDataURL(qrValue, { errorCorrectionLevel: 'H' }, (err, url) => {
                if (err) console.error(err);
                setQrCodeDataUrl(url);
            });
        } else {
             setQrCodeDataUrl('');
        }
    }
  }, [object]);

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
    if (object.type === 'text' && isEditing) {
      return renderTextEditor(object);
    }
    
    switch (object.type) {
      case 'text':
        const textStyle: React.CSSProperties = {
          fontSize: object.fontSize,
          fontWeight: object.fontWeight,
          fontFamily: object.fontFamily,
          color: object.color,
          width: '100%',
          height: '100%',
          textAlign: object.textAlign,
          padding: '0 5px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        };
        return <div style={textStyle} onDoubleClick={() => onDoubleClick(object.id)}>{object.text}</div>;
      case 'image':
        const imageObject = object as ImageObjectType;
        return (
          <Image
            src={imageObject.src}
            alt="Canvas image"
            width={imageObject.width}
            height={imageObject.height}
            className="w-full h-full pointer-events-none"
            style={{ objectFit: 'fill' }}
            draggable={false}
          />
        );
      case 'barcode':
        return (
            <div className='w-full h-full flex items-center justify-center' style={{backgroundColor: '#FFFFFF'}}>
                 <svg ref={barcodeRef} />
            </div>
        );
      case 'qrcode':
            if (qrCodeDataUrl) {
                return <Image src={qrCodeDataUrl} alt="QR Code" layout="fill" objectFit="contain" />;
            }
            return (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground text-xs p-2">
                    <QrCode className="w-1/2 h-1/2" />
                    <span>QR Code</span>
                </div>
            )
      default:
        return null;
    }
  };

  const renderTextEditor = (textObject: TextObject) => {
    const textStyle: React.CSSProperties = {
      fontSize: textObject.fontSize,
      fontWeight: textObject.fontWeight,
      fontFamily: textObject.fontFamily,
      color: textObject.color,
      textAlign: textObject.textAlign,
      lineHeight: 1.2,
      padding: '0 5px',
    };

    return (
        <textarea
            ref={textAreaRef}
            value={textObject.text}
            onChange={(e) => onUpdate(textObject.id, { text: e.target.value })}
            onBlur={onStopEditing}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
            className="absolute inset-0 w-full h-full bg-transparent resize-none border-none outline-none"
            style={textStyle}
        />
    )
  }

  const handlePointerDown = (e: React.PointerEvent, type: InteractionType, handle: InteractionHandle) => {
    if (isEditing) return;
    e.stopPropagation();
    onInteractionStart(e, object.id, type, handle);
  };
  
  const handleDuplicateClick = (e: React.PointerEvent) => {
    e.stopPropagation();
    onDuplicate(object.id);
  };


  return (
    <div
      style={style}
      onPointerDown={(e) => handlePointerDown(e, 'drag', 'body')}
      className={cn(
        'outline-none select-none',
        isSelected && !isEditing && 'outline-accent outline-dashed outline-1'
      )}
    >
      {renderObjectContent()}
      {isSelected && !isEditing &&(
        <>
          {/* Resize Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'nw')} />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'ne')} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'sw')} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-accent rounded-full cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'resize', 'se')} />
          
           {/* Duplicate Handle */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 bg-white border border-accent rounded-full cursor-pointer"
            onPointerDown={handleDuplicateClick}
            title="Duplicate"
          >
            <Copy className="w-3 h-3 text-accent" />
          </div>

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
