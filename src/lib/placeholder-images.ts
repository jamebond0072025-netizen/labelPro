
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  width?: number;
  height?: number;
  templateUrl?: string;
};

// This can now be an empty array as data is fetched from the API.
export const PlaceHolderImages: ImagePlaceholder[] = [];

    