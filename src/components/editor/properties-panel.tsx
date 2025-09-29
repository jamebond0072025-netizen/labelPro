

'use client';

import { CanvasObject, TextObject, BarcodeObject, QRCodeObject, CanvasSettings, ImageObject, QRCodeType } from '@/lib/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { CanvasProperties } from './canvas-properties';
import { Button } from '../ui/button';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { uploadImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const googleFonts = [
    'Poppins', 'PT Sans', 'Roboto', 'Open Sans', 'Lato', 
    'Montserrat', 'Oswald', 'Raleway', 'Merriweather', 'Playfair Display'
];

const qrCodeTypes: { value: QRCodeType, label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'url', label: 'URL' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'location', label: 'Location' },
];

interface PropertiesPanelProps {
  selectedObject: CanvasObject | undefined;
  onUpdate: (id: string, newProps: Partial<CanvasObject>) => void;
  onDelete: () => void;
  canvasSettings?: CanvasSettings;
  onUpdateCanvasSettings?: (newSettings: Partial<CanvasSettings>) => void;
}

export function PropertiesPanel({
  selectedObject,
  onUpdate,
  onDelete,
  canvasSettings,
  onUpdateCanvasSettings,
}: PropertiesPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token, tenantId } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();


  if (!selectedObject) {
    if (canvasSettings && onUpdateCanvasSettings) {
      return (
        <CanvasProperties
          settings={canvasSettings}
          onUpdate={onUpdateCanvasSettings}
        />
      );
    }
    return (
      <ScrollArea className="h-full">
        <div className="p-4 pt-12 border-l h-full bg-card">
          <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Select an object to edit</p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const handleUpdate = (props: Partial<CanvasObject>) => {
    onUpdate(selectedObject.id, props);
  };

  const handleTextUpdate = (props: Partial<TextObject>) => {
    onUpdate(selectedObject.id, props);
  };
  
  const handleBarcodeUpdate = (props: Partial<BarcodeObject>) => {
    onUpdate(selectedObject.id, props);
  };

  const handleQRCodeUpdate = (props: Partial<QRCodeObject>) => {
    onUpdate(selectedObject.id, props);
  };
  
  const handleImageUpdate = (props: Partial<ImageObject>) => {
    onUpdate(selectedObject.id, props);
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file, { token, tenantId }, toast);
        handleImageUpdate({ src: imageUrl });
      } catch (error) {
        console.error("Image upload failed", error);
      } finally {
        setIsUploading(false);
      }
    }
  };


  const renderPlaceholderKeyProperty = () => {
    if (!('key' in selectedObject) || selectedObject.key === undefined) return null;
    
    return (
        <div className="space-y-2">
            <Label htmlFor="placeholder-key">Key</Label>
            <Input
                id="placeholder-key"
                value={selectedObject.key}
                onChange={(e) => handleUpdate({ key: e.target.value })}
            />
        </div>
    );
  }

  const renderTextProperties = () => {
    if (selectedObject.type !== 'text') return null;
    const textObject = selectedObject as TextObject;
    const isPlaceholder = textObject.key !== undefined;

    return (
      <>
        {!isPlaceholder && (
            <div className="space-y-2">
            <Label htmlFor="text-content">Text</Label>
            <Textarea
                id="text-content"
                value={textObject.text}
                onChange={(e) => handleTextUpdate({ text: e.target.value })}
                rows={3}
            />
            </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={textObject.fontFamily}
            onValueChange={(value) => handleTextUpdate({ fontFamily: value })}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {googleFonts.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
            <Label htmlFor="font-size">Size</Label>
            <Input
                id="font-size"
                type="number"
                value={textObject.fontSize}
                onChange={(e) =>
                handleTextUpdate({ fontSize: parseInt(e.target.value, 10) })
                }
            />
            </div>
            <div className="space-y-2">
                <Label htmlFor="font-weight">Weight</Label>
                 <Select
                    value={textObject.fontWeight}
                    onValueChange={(value: 'normal' | 'bold') => handleTextUpdate({ fontWeight: value })}
                >
                    <SelectTrigger id="font-weight">
                        <SelectValue placeholder="Weight" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="text-color">Color</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="text-color"
                    type="text"
                    value={textObject.color}
                    onChange={(e) => handleTextUpdate({ color: e.target.value })}
                />
                <Input
                    type="color"
                    className="w-10 p-1"
                    value={textObject.color}
                    onChange={(e) => handleTextUpdate({ color: e.target.value })}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-1">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'left' })}
                    className={cn(textObject.textAlign === 'left' && 'bg-accent')}
                >
                    <AlignLeft />
                </Button>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'center' })}
                    className={cn(textObject.textAlign === 'center' && 'bg-accent')}
                 >
                    <AlignCenter />
                </Button>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleTextUpdate({ textAlign: 'right' })}
                    className={cn(textObject.textAlign === 'right' && 'bg-accent')}
                 >
                    <AlignRight />
                </Button>
            </div>
        </div>
      </>
    );
  };
  
    const renderBarcodeProperties = () => {
    if (selectedObject.type !== 'barcode') return null;
    const barcodeObject = selectedObject as BarcodeObject;
    const isPlaceholder = barcodeObject.key !== undefined;


    return (
      <>
        {!isPlaceholder && (
            <div className="space-y-2">
            <Label htmlFor="barcode-value">Barcode Value</Label>
            <Input
                id="barcode-value"
                value={barcodeObject.value}
                onChange={(e) => handleBarcodeUpdate({ value: e.target.value })}
            />
            </div>
        )}
      </>
    );
  };

  const renderQRCodeProperties = () => {
    if (selectedObject.type !== 'qrcode') return null;
    const qrCodeObject = selectedObject as QRCodeObject;
    const isPlaceholder = qrCodeObject.key !== undefined;

    return (
      <>
        <div className="space-y-2">
            <Label htmlFor="qrcode-type">QR Code Type</Label>
            <Select
                value={qrCodeObject.qrCodeType}
                onValueChange={(value: QRCodeType) => handleQRCodeUpdate({ qrCodeType: value })}
            >
                <SelectTrigger id="qrcode-type">
                    <SelectValue placeholder="Select QR Code Type" />
                </SelectTrigger>
                <SelectContent>
                    {qrCodeTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        {isPlaceholder && (
            <p className="text-xs text-muted-foreground">
                The value for this {qrCodeObject.qrCodeType} QR code will be provided by the <code>{qrCodeObject.key}</code> data field.
            </p>
        )}

        {!isPlaceholder && qrCodeObject.qrCodeType === 'text' && (
            <div className="space-y-2">
                <Label htmlFor="qrcode-value">Text</Label>
                <Textarea
                    id="qrcode-value"
                    value={qrCodeObject.value}
                    onChange={(e) => handleQRCodeUpdate({ value: e.target.value })}
                    rows={3}
                />
            </div>
        )}
        
        {!isPlaceholder && qrCodeObject.qrCodeType === 'url' && (
            <div className="space-y-2">
                <Label htmlFor="qrcode-url">URL</Label>
                <Input
                    id="qrcode-url"
                    type="url"
                    value={qrCodeObject.value || ''}
                    onChange={(e) => handleQRCodeUpdate({ value: e.target.value })}
                    placeholder="https://example.com"
                />
            </div>
        )}

        {!isPlaceholder && qrCodeObject.qrCodeType === 'phone' && (
             <div className="space-y-2">
                <Label htmlFor="qrcode-phone">Phone Number</Label>
                <Input
                    id="qrcode-phone"
                    type="tel"
                    value={qrCodeObject.phone || ''}
                    onChange={(e) => handleQRCodeUpdate({ phone: e.target.value })}
                    placeholder="e.g. +14155552671"
                />
            </div>
        )}

        {!isPlaceholder && qrCodeObject.qrCodeType === 'email' && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="qrcode-email-address">Email Address</Label>
                    <Input
                        id="qrcode-email-address"
                        type="email"
                        value={qrCodeObject.email || ''}
                        onChange={(e) => handleQRCodeUpdate({ email: e.target.value })}
                        placeholder="e.g. name@example.com"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="qrcode-email-subject">Subject</Label>
                    <Input
                        id="qrcode-email-subject"
                        value={qrCodeObject.subject || ''}
                        onChange={(e) => handleQRCodeUpdate({ subject: e.target.value })}
                        placeholder="Optional subject line"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="qrcode-email-body">Body</Label>
                     <Textarea
                        id="qrcode-email-body"
                        value={qrCodeObject.body || ''}
                        onChange={(e) => handleQRCodeUpdate({ body: e.target.value })}
                        placeholder="Optional email body"
                        rows={3}
                    />
                </div>
            </div>
        )}

        {!isPlaceholder && qrCodeObject.qrCodeType === 'whatsapp' && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="qrcode-whatsapp-phone">Phone Number</Label>
                    <Input
                        id="qrcode-whatsapp-phone"
                        type="tel"
                        value={qrCodeObject.phone || ''}
                        onChange={(e) => handleQRCodeUpdate({ phone: e.target.value })}
                        placeholder="Include country code, e.g. 14155552671"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="qrcode-whatsapp-message">Message</Label>
                    <Textarea
                        id="qrcode-whatsapp-message"
                        value={qrCodeObject.message || ''}
                        onChange={(e) => handleQRCodeUpdate({ message: e.target.value })}
                        placeholder="Optional pre-filled message"
                        rows={3}
                    />
                </div>
            </div>
        )}

         {!isPlaceholder && qrCodeObject.qrCodeType === 'location' && (
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="qrcode-location-lat">Latitude</Label>
                        <Input
                            id="qrcode-location-lat"
                            value={qrCodeObject.latitude || ''}
                            onChange={(e) => handleQRCodeUpdate({ latitude: e.target.value })}
                            placeholder="e.g. 37.7749"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qrcode-location-lon">Longitude</Label>
                        <Input
                            id="qrcode-location-lon"
                            value={qrCodeObject.longitude || ''}
                            onChange={(e) => handleQRCodeUpdate({ longitude: e.target.value })}
                            placeholder="e.g. -122.4194"
                        />
                    </div>
                </div>
            </div>
        )}
      </>
    );
  };
  
  const renderImageProperties = () => {
    if (selectedObject.type !== 'image') return null;
    const imageObject = selectedObject as ImageObject;
    const isPlaceholder = imageObject.key !== undefined;
    
    if (isPlaceholder) return null;

    return (
        <div className="space-y-2">
            <Label htmlFor="image-src">Image Source</Label>
            <div className="flex items-center gap-2">
                <Input
                    id="image-src"
                    value={imageObject.src}
                    onChange={(e) => handleImageUpdate({ src: e.target.value })}
                    placeholder="Enter image URL"
                />
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    )
  }


  return (
    <ScrollArea className="h-full">
      <div className="p-4 pt-12 space-y-4">
        <h3 className="text-lg font-headline font-semibold capitalize">
          {selectedObject.type} Properties
        </h3>
        
        {renderPlaceholderKeyProperty()}

        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-2">
            <Label htmlFor="pos-x">X</Label>
            <Input
              id="pos-x"
              type="number"
              value={Math.round(selectedObject.x)}
              onChange={(e) => handleUpdate({ x: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pos-y">Y</Label>
            <Input
              id="pos-y"
              type="number"
              value={Math.round(selectedObject.y)}
              onChange={(e) => handleUpdate({ y: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-w">W</Label>
            <Input
              id="size-w"
              type="number"
              value={Math.round(selectedObject.width)}
              onChange={(e) =>
                handleUpdate({ width: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-h">H</Label>
            <Input
              id="size-h"
              type="number"
              value={Math.round(selectedObject.height)}
              onChange={(e) =>
                handleUpdate({ height: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rotation">Rotation</Label>
          <Input
            id="rotation"
            type="number"
            value={Math.round(selectedObject.rotation)}
            onChange={(e) =>
              handleUpdate({ rotation: parseInt(e.target.value, 10) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Opacity</Label>
          <Slider
            value={[selectedObject.opacity]}
            max={1}
            step={0.01}
            onValueChange={(value) => handleUpdate({ opacity: value[0] })}
          />
        </div>
        
        <Separator />

        {renderTextProperties()}
        {renderImageProperties()}
        {renderBarcodeProperties()}
        {renderQRCodeProperties()}

        <Separator />
        
        <div className="pt-4">
            <Button variant="destructive-outline" className="w-full" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Object
            </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
