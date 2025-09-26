
'use client';

import { useState, useMemo } from 'react';
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
import { toPng } from 'html-to-image';
import { Textarea } from './ui/textarea';


interface SaveTemplateDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    editorState: EditorState;
}

export function SaveTemplateDialog({ isOpen, onOpenChange, editorState }: SaveTemplateDialogProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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
        // The structure should be an array of objects for bulk operations
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
            // 1. Generate Preview Image
            const previewImageUrl = await toPng(editorState.canvasRef.current, {
                quality: 0.8,
                width: editorState.canvasSettings.width,
                height: editorState.canvasSettings.height,
            });

            // 2. Prepare designJson
            const designJson = JSON.stringify({
                settings: editorState.canvasSettings,
                objects: editorState.objects,
            });

            // 3. Construct the payload
            const payload = {
                name,
                description,
                category,
                designJson,
                bulkDataJson,
                previewImageUrl, // This is a base64 data URL. Your backend needs to handle it.
            };

            // 4. TODO: Send to your API
            console.log("Saving template data:", payload);
            // Example of what the fetch call would look like:
            /*
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }
            */

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast({ title: 'Template Saved!', description: 'Your design has been saved successfully.' });
            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error Saving', description: 'Could not save the template.' });
        } finally {
            setIsSaving(false);
        }
    }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
                Enter the details for your new template. This will be visible to others in your organization.
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
                {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
