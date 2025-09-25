
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
              background: "transparent",
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
  };

  const xScale = settings.width / (settings.originalWidth || settings.width);
  const yScale = settings.height / (settings.originalHeight || settings.height);


  return (
    <div style={canvasStyle}>
      {populatedObjects.map(obj => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: obj.x * xScale,
          top: obj.y * yScale,
          width: obj.width * xScale,
          height: obj.height * yScale,
          transform: `rotate(${obj.rotation}deg)`,
          transformOrigin: 'top left',
          opacity: obj.opacity,
        };

        if (obj.type === 'text') {
          const textObject = obj as TextObject;
          const textStyle: React.CSSProperties = {
            ...style,
            fontSize: textObject.fontSize * Math.min(xScale, yScale),
            fontWeight: textObject.fontWeight,
            fontFamily: textObject.fontFamily,
            color: textObject.color,
            textAlign: textObject.textAlign,
            padding: '0 5px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            display: 'flex',
            alignItems: 'center',
            justifyContent: textObject.textAlign,
          };
          return <div key={obj.id} style={textStyle}><div>{textObject.text}</div></div>;
        }

        if (obj.type === 'image') {
          const imageObject = obj as ImageObject;
          return (
            <div key={obj.id} style={style}>
              <Image
                src={imageObject.src}
                alt=""
                layout="fill"
                objectFit="contain"
              />
            </div>
          );
        }

        if (obj.type === 'barcode') {
          return (
            <div key={obj.id} style={style}>
              <div className='w-full h-full flex items-center justify-center' style={{ backgroundColor: 'transparent' }}>
                <svg ref={el => barcodeRefs.current.set(obj.id, el)} width="100%" height="100%"/>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
