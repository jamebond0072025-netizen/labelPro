
'use client';

import React from 'react';
import Image from 'next/image';
import JsBarcode from 'jsbarcode';
import type { CanvasObject, CanvasSettings, TextObject, ImageObject, BarcodeObject } from '@/lib/types';

interface LabelPreviewProps {
  objects: CanvasObject[];
  settings: CanvasSettings;
  data: Record<string, any>;
}

export function LabelPreview({ objects, settings, data }: LabelPreviewProps) {
  const barcodeRefs = React.useRef<Map<string, SVGSVGElement | null>>(new Map());

  const populatedObjects = React.useMemo(() => {
    return objects.map(obj => {
      if ('key' in obj && obj.key && data[obj.key]) {
        const newValue = data[obj.key];
        if (obj.type === 'text') {
          return { ...obj, text: newValue };
        }
        if (obj.type === 'image') {
          return { ...obj, src: newValue };
        }
        if (obj.type === 'barcode') {
          return { ...obj, value: newValue };
        }
      }
      return obj;
    });
  }, [objects, data]);

  React.useEffect(() => {
    populatedObjects.forEach(object => {
      if (object.type === 'barcode' && barcodeRefs.current.has(object.id)) {
        const barcodeObject = object as BarcodeObject;
        const svgElement = barcodeRefs.current.get(object.id);
        if (svgElement) {
          try {
            JsBarcode(svgElement, barcodeObject.value, {
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
      }
    });
  }, [populatedObjects]);
  
  const canvasStyle: React.CSSProperties = {
    width: settings.width,
    height: settings.height,
    backgroundColor: settings.backgroundColor,
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    transform: 'scale(1)',
    transformOrigin: 'top left',
  };

  return (
    <div style={canvasStyle}>
      {populatedObjects.map(obj => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: obj.x,
          top: obj.y,
          width: obj.width,
          height: obj.height,
          transform: `rotate(${obj.rotation}deg)`,
          opacity: obj.opacity,
        };

        if (obj.type === 'text') {
          const textStyle: React.CSSProperties = {
            ...style,
            fontSize: obj.fontSize,
            fontWeight: obj.fontWeight,
            fontFamily: obj.fontFamily,
            color: obj.color,
            textAlign: obj.textAlign,
            padding: '0 5px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          };
          return <div key={obj.id} style={textStyle}>{obj.text}</div>;
        }

        if (obj.type === 'image') {
          const imageObject = obj as ImageObject;
          return (
            <div key={obj.id} style={style}>
              <Image
                src={imageObject.src}
                alt=""
                width={imageObject.width}
                height={imageObject.height}
                className="w-full h-full"
                style={{ objectFit: 'fill' }}
              />
            </div>
          );
        }

        if (obj.type === 'barcode') {
          return (
            <div key={obj.id} style={style}>
              <div className='w-full h-full flex items-center justify-center' style={{ backgroundColor: '#FFFFFF' }}>
                <svg ref={el => barcodeRefs.current.set(obj.id, el)} />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

