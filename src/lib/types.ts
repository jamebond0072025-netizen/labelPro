

export interface BaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  key?: string;
}

export interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageObject extends BaseObject {
  type: 'image';
  src: string;
}

export interface BarcodeObject extends BaseObject {
  type: 'barcode';
  value: string;
}

export type QRCodeType = 'text' | 'url' | 'phone' | 'email' | 'whatsapp' | 'location';

export interface QRCodeObject extends BaseObject {
    type: 'qrcode';
    qrCodeType: QRCodeType;
    value: string; // For text and URL
    phone?: string; // For phone & whatsapp
    email?: string;
    subject?: string;
    body?: string;
    message?: string; // For whatsapp
    latitude?: string;
    longitude?: string;
}


export type CanvasObject = TextObject | ImageObject | BarcodeObject | QRCodeObject;

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  originalWidth?: number;
  originalHeight?: number;
}

export type Alignment = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontally' | 'distribute-vertically';

export type ItemType =
  | 'placeholder-text'
  | 'static-text'
  | 'placeholder-image'
  | 'static-image'
  | 'barcode'
  | 'placeholder-qr'
  | 'static-qr';

export interface Template {
    id: number;
    userId: string;
    name: string;
    description: string | null;
    category: string | null;
    designJson: string | { settings: CanvasSettings; objects: CanvasObject[] };
    bulkDataJson: string | null;
    previewImageUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
}
