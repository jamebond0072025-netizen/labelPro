

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { CanvasObject, CanvasSettings, TextObject, ImageObject, BarcodeObject, QRCodeObject } from '@/lib/types';
import { QrCode } from 'lucide-react';

interface LabelPreviewProps {
  objects: CanvasObject[];
  settings: CanvasSettings;
  data: Record<string, any>;
}

const getQRCodeValue = (object: QRCodeObject): string => {
    const dataValue = (object.key && typeof object.value === 'object' && object.value !== null) 
        ? object.value as any 
        : object;

    switch (object.qrCodeType) {
        case 'url':
            return dataValue.value || '';
        case 'phone':
            return `tel:${dataValue.phone || dataValue.value || ''}`;
        case 'email':
            const subject = dataValue.subject ? `?subject=${encodeURIComponent(dataValue.subject)}` : '';
            const body = dataValue.body ? `${subject ? '&' : '?'}body=${encodeURIComponent(dataValue.body)}` : '';
            return `mailto:${dataValue.email || ''}${subject}${body}`;
        case 'whatsapp':
            const message = dataValue.message ? `?text=${encodeURIComponent(dataValue.message)}` : '';
            return `https://wa.me/${dataValue.phone || ''}${message}`;
        case 'location':
            return `geo:${dataValue.latitude || 0},${dataValue.longitude || 0}`;
        case 'text':
        default:
            // Handles simple string values from CSVs for text, url, phone types
            if (typeof dataValue.value === 'string') {
                return dataValue.value;
            }
            return '';
    }
}


export function LabelPreview({ objects, settings, data }: LabelPreviewProps) {
  const barcodeRefs = React.useRef<Map<string, SVGSVGElement | null>>(new Map());
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  const populatedObjects = React.useMemo(() => {
    return objects.map(obj => {
      if ('key' in obj && obj.key && data[obj.key] !== undefined) {
        const newValue = data[obj.key];
        
        if (obj.type === 'qrcode') {
            const qrObj = { ...obj };
             if (typeof newValue === 'string' && newValue.trim().startsWith('{')) {
                try {
                    const parsedValue = JSON.parse(newValue);
                    // Here, we should put the parsed object into the `value` property for `getQRCodeValue` to process
                    return { ...qrObj, value: parsedValue };
                } catch (e) {
                    console.error("Failed to parse QR code JSON string from data:", newValue, e);
                    return { ...qrObj, value: newValue }; // Fallback to raw string
                }
            }
            // For simple values (text, url, phone) from CSV/data
            return { ...qrObj, value: newValue };
        }
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

  const originalWidth = settings.originalWidth || settings.width;
  const scale = settings.width / originalWidth;

  useEffect(() => {
    const generateQrCodes = async () => {
        const urls: Record<string, string> = {};
        for (const object of populatedObjects) {
            if (object.type === 'qrcode') {
                const qrObject = object as QRCodeObject;
                const qrValue = getQRCodeValue(qrObject);
                if (qrValue) {
                    try {
                        const url = await QRCode.toDataURL(qrValue, { errorCorrectionLevel: 'H' });
                        urls[qrObject.id] = url;
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        }
        setQrCodeDataUrls(urls);
    };

    generateQrCodes();
  }, [populatedObjects]);


  React.useEffect(() => {
    populatedObjects.forEach(object => {
      if (object.type === 'barcode' && barcodeRefs.current.has(object.id)) {
        const barcodeObject = object as BarcodeObject;
        const svgElement = barcodeRefs.current.get(object.id);
        if (svgElement && barcodeObject.value) {
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
    position: 'relative',
    overflow: 'hidden',
  };

  const scaledContentStyle: React.CSSProperties = {
    width: originalWidth,
    height: settings.originalHeight || settings.height,
    backgroundColor: settings.backgroundColor,
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
  };


  return (
    <div style={canvasStyle}>
      <div style={scaledContentStyle}>
        {populatedObjects.map(obj => {
            const style: React.CSSProperties = {
            position: 'absolute',
            left: obj.x,
            top: obj.y,
            width: obj.width,
            height: obj.height,
            transform: `rotate(${obj.rotation}deg)`,
            transformOrigin: 'center center',
            opacity: obj.opacity,
            boxSizing: 'border-box'
            };

            if (obj.type === 'text') {
            const textObject = obj as TextObject;
            const textStyle: React.CSSProperties = {
                ...style,
                fontSize: textObject.fontSize,
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
                    unoptimized
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

            if (obj.type === 'qrcode') {
                const dataUrl = qrCodeDataUrls[obj.id];
                return (
                    <div key={obj.id} style={style}>
                        {dataUrl ? (
                            <Image src={dataUrl} alt="QR Code" layout="fill" objectFit="contain" />
                        ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground text-xs p-2">
                                <QrCode className="w-1/2 h-1/2" />
                                <span>QR Code</span>
                            </div>
                        )}
                    </div>
                );
            }

            return null;
        })}
      </div>
    </div>
  );
}
