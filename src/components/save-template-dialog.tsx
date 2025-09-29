
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { EditorState } from '@/contexts/editor-context';
import { toJpeg } from 'html-to-image';
import { Textarea } from './ui/textarea';
import type { Template } from '@/lib/types';
import { createMockTemplate, updateMockTemplate } from '@/lib/mock-api';
import { USE_DUMMY_TEMPLATES } from '@/lib/config';
import { apiCall } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';


function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

const getCompressedImage = async (node: HTMLElement, width: number, height: number): Promise<string> => {
    let quality = 0.95;
    const targetSize = 48 * 1024; // 48KB target, leaving a small buffer

    while (quality > 0.1) {
        const dataUrl = await toJpeg(node, {
            quality,
            width,
            height,
        });

        // Check size of the data URL
        // Formula: (length * 3/4) - padding
        const sizeInBytes = (dataUrl.length * (3/4)) - (dataUrl.endsWith('==') ? 2 : (dataUrl.endsWith('=') ? 1: 0));

        if (sizeInBytes <= targetSize) {
            return dataUrl;
        }
        quality -= 0.1;
    }
    
    // If loop finishes, return lowest quality version
     return toJpeg(node, {
        quality: 0.1,
        width,
        height,
    });
};

interface SaveTemplateDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    editorState: EditorState;
    existingTemplate?: Template;
}

export function SaveTemplateDialog({ isOpen, onOpenChange, editorState, existingTemplate }: SaveTemplateDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { token, tenantId } = useAuth();
    const [name, setName] = useState(existingTemplate?.name || '');
    const [description, setDescription] = useState(existingTemplate?.description || '');
    const [category, setCategory] = useState(existingTemplate?.category || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingTemplate) {
            setName(existingTemplate.name);
            setDescription(existingTemplate.description || '');
            setCategory(existingTemplate.category || '');
        }
    }, [existingTemplate]);

    const bulkDataJson = useMemo(() => {
        if (!editorState) return '[]';
        const data: Record<string, any> = {};
        const placeholderObjects = editorState.objects.filter(obj => 'key' in obj && obj.key);

        placeholderObjects.forEach(obj => {
            if (obj.key) {
                switch(obj.type) {
                    case 'text':
                        data[obj.key] = "Sample Text";
                        break;
                    case 'image':
                        data[obj.key] = "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500";
                        break;
                    case 'barcode':
                        data[obj.key] = "123456789012";
                        break;
                }
            }
        });
        return JSON.stringify([data], null, 2);
    }, [editorState]);

    const handleSave = async () => {
        if (!name) {
            toast({ variant: 'destructive', title: 'Name is required' });
            return;
        }
        if (!editorState || !editorState.canvasRef?.current) {
            toast({ variant: 'destructive', title: 'Editor not ready', description: 'Could not get canvas reference.' });
            return;
        }

        setIsSaving(true);
        
        try {
            const previewImage = await getCompressedImage(
                editorState.canvasRef.current,
                editorState.canvasSettings.width,
                editorState.canvasSettings.height
            );

            const designJson = JSON.stringify({
                settings: editorState.canvasSettings,
                objects: editorState.objects,
            });

            if (USE_DUMMY_TEMPLATES) {
                const templateData = {
                    name,
                    description,
                    category,
                    designJson,
                    bulkDataJson,
                    previewImageUrl: previewImage
                };
                if (existingTemplate) {
                    await updateMockTemplate(existingTemplate.id, templateData);
                } else {
                    await createMockTemplate(templateData);
                }
            } else {
                const formData = new FormData();
                formData.append('Name', name);
                formData.append('Description', description);
                formData.append('Category', category);
                formData.append('DesignJson', designJson);
                formData.append('BulkDataJson', bulkDataJson);
                
                const imageFile = dataURLtoFile(previewImage, `${name.replace(/\s+/g, '-')}-preview.jpg`);
                formData.append('PreviewImage', imageFile);

                const endpoint = existingTemplate ? `/LabelTemplate/${existingTemplate.id}` : '/LabelTemplate';
                const method = existingTemplate ? 'PUT' : 'POST';

                await apiCall({ url: endpoint, method, data: formData }, { token, tenantId });
            }
            
            toast({ title: `Template ${existingTemplate ? 'Updated' : 'Saved'}!`, description: 'Your design has been saved successfully.' });
            onOpenChange(false);
            // This is a bit of a hack to force a refresh on the homepage.
            // A more robust solution might involve a global state management library.
            router.push('/');
            setTimeout(() => router.refresh(), 100);

        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || error.message || 'Could not save the template.';
            toast({ variant: 'destructive', title: 'Error Saving', description: message });
        } finally {
            setIsSaving(false);
        }
    }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>{existingTemplate ? 'Update Template' : 'Save New Template'}</DialogTitle>
            <DialogDescription>
                Enter the details for your template. This will be visible to others in your organization.
            </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="template-name">Name</Label>
                <Input id="template-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., 4x2 Product Label" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea id="template-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief summary of what this template is for." />
            </div>
             <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Input id="template-category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Shipping, Inventory, Retail" />
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : (existingTemplate ? 'Update Template' : 'Save Template')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
