
export interface BaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
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

export type CanvasObject = TextObject | ImageObject | BarcodeObject;

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
}

export type Alignment = 
  | 'left' | 'center' | 'right' 
  | 'top' | 'middle' | 'bottom'
  | 'distribute-horizontally' | 'distribute-vertically';
