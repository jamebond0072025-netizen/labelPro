'use client';

import { useState, useMemo } from 'react';
import type { CanvasObject } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface DataPanelProps {
    objects: CanvasObject[];
}

export function DataPanel({ objects }: DataPanelProps) {
    const { toast } = useToast();

    const placeholderData = useMemo(() => {
        const data: Record<string, any> = {};
        const placeholderObjects = objects.filter(obj => 'key' in obj && obj.key);

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

        return data;
    }, [objects]);

    const jsonString = useMemo(() => JSON.stringify(placeholderData, null, 2), [placeholderData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        toast({
            title: "Copied to clipboard!",
            description: "The JSON data has been copied.",
        });
    }

    return (
       <ScrollArea className="h-full">
            <div className="p-4 pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                    This is the JSON representation of all placeholder items on your canvas. Use this schema to provide data to render your labels.
                </p>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={handleCopy}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted rounded-md p-4 text-xs overflow-x-auto">
                        <code>{jsonString}</code>
                    </pre>
                </div>
            </div>
        </ScrollArea>
    );
}