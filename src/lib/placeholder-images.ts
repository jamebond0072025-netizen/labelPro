

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  width?: number;
  height?: number;
  designJson?: string;
};

// This is now populated from the API call in page.tsx
export let PlaceHolderImages: ImagePlaceholder[] = [];

// Function to update the placeholders, called from page.tsx
export function setPlaceHolderImages(images: ImagePlaceholder[]) {
  PlaceHolderImages = images;
}

    