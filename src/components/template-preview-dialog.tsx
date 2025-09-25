
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import type { ImagePlaceholder } from "@/lib/placeholder-images"

interface TemplatePreviewDialogProps {
  template: ImagePlaceholder;
  onOpenChange: (isOpen: boolean) => void;
}

export function TemplatePreviewDialog({ template, onOpenChange }: TemplatePreviewDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{template.description}</DialogTitle>
          {template.width && template.height && (
            <DialogDescription>
              Dimensions: {template.width}px x {template.height}px
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="relative aspect-[10/14] w-full mt-4">
          <Image
            src={template.imageUrl}
            alt={template.description}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <Link href={`/dashboard/editor?template=${template.id}`}>Use this Template</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
