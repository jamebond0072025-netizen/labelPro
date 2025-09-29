

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CanvasObject, QRCodeObject } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import Papa from 'papaparse';


interface DataPanelProps {
    objects: CanvasObject[];
    onReplaceData: (data: Record<string, any>) => void;
}

export function DataPanel({ objects, onReplaceData }: DataPanelProps) {
    const { toast } = useToast();
    const [jsonInput, setJsonInput] = useState('');

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
                    case 'qrcode':
                        const qrObject = obj as QRCodeObject;
                        switch(qrObject.qrCodeType) {
                            case 'text':
                                data[obj.key] = "Sample QR Text";
                                break;
                             case 'url':
                                data[obj.key] = "https://example.com";
                                break;
                            case 'phone':
                                data[obj.key] = "14155552671";
                                break;
                            case 'email':
                                data[obj.key] = { email: "test@example.com", subject: "Hello", body: "This is a test email" };
                                break;
                            case 'whatsapp':
                                data[obj.key] = { phone: "14155552671", message: "Hello from my label!" };
                                break;
                            case 'location':
                                data[obj.key] = { latitude: "37.7749", longitude: "-122.4194" };
                                break;
                            default:
                                data[obj.key] = "Sample Value";
                        }
                        break;
                }
            }
        });

        return data;
    }, [objects]);

    const jsonSchemaString = useMemo(() => JSON.stringify(placeholderData, null, 2), [placeholderData]);

    const handleCopySchema = () => {
        navigator.clipboard.writeText(jsonSchemaString);
        toast({
            title: "Copied to clipboard!",
            description: "The JSON schema has been copied.",
        });
    }

    const handleApplyData = () => {
        try {
            const data = JSON.parse(jsonInput);
            onReplaceData(data);
            toast({
                title: "Data Applied",
                description: "Canvas objects have been updated with the provided data.",
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Invalid JSON",
                description: "Please check your JSON format.",
            });
        }
    }

     const handleDownloadCSV = useCallback(() => {
        const dataForCsv = [placeholderData];

        const csvData = dataForCsv.map(row => {
            const newRow: { [key: string]: string } = {};
            for (const key in row) {
                if (typeof row[key] === 'object' && row[key] !== null) {
                    newRow[key] = JSON.stringify(row[key]);
                } else {
                    newRow[key] = row[key];
                }
            }
            return newRow;
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'template_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [placeholderData]);


    return (
       <ScrollArea className="h-full">
            <div className="p-4 pt-4 space-y-4">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        Use the schema below to structure your data. You can paste JSON data for testing or download a sample CSV.
                    </p>

                    <div className="relative">
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleDownloadCSV}
                                title="Download CSV template"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleCopySchema}
                                title="Copy JSON schema"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <pre className="bg-muted rounded-md p-4 text-xs overflow-x-auto">
                            <code className="whitespace-pre-wrap break-words">{jsonSchemaString}</code>
                        </pre>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="json-input">Test Data (JSON)</Label>
                    <Textarea 
                        id="json-input"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='{ "text_1": "My Custom Text" }'
                        rows={5}
                    />
                </div>
                <Button onClick={handleApplyData} className="w-full">Apply Data</Button>

            </div>
        </ScrollArea>
    );
}
