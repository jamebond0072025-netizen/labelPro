

import type { Template } from "./types";

export interface ImagePlaceholder {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  width?: number;
  height?: number;
  designJson?: string | object;
  template?: Template;
};

// This is now populated from the API call in page.tsx
export let PlaceHolderImages: ImagePlaceholder[] = [];

// Function to update the placeholders, called from page.tsx
export function setPlaceHolderImages(images: ImagePlaceholder[]) {
  PlaceHolderImages = images;
}
