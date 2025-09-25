
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ImagePlaceholder } from "@/lib/placeholder-images"
import { useRouter } from 'next/navigation';
import { Package, FileText, Upload, ClipboardPaste } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from './ui/textarea';


interface UseTemplateDialogProps {
  template: ImagePlaceholder;
  onOpenChange: (isOpen: boolean) => void;
}

type Step = 'select-type' | 'upload-data';
type LabelType = 'product' | 'custom' | null;


export function UseTemplateDialog({ template, onOpenChange }: UseTemplateDialogProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>('select-type');
    const [labelType, setLabelType] = useState<LabelType>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [jsonInput, setJsonInput] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setJsonInput(''); // Clear json input if a file is selected
        }
    };
    
    const renderSelectType = () => (
        <>
            <DialogHeader>
                <DialogTitle>Select Label Type</DialogTitle>
                <DialogDescription>
                    Choose the type of label you want to create with the &quot;{template.description}&quot; template.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <Card 
                    className={cn("cursor-pointer hover:border-primary", labelType === 'product' && 'border-primary ring-2 ring-primary')}
                    onClick={() => setLabelType('product')}
                >
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                        <Package className="h-8 w-8 text-primary" />
                        <span className="font-semibold">Product Label</span>
                    </CardContent>
                </Card>
                <Card 
                    className={cn("cursor-pointer hover:border-primary", labelType === 'custom' && 'border-primary ring-2 ring-primary')}
                    onClick={() => setLabelType('custom')}
                >
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                        <FileText className="h-8 w-8 text-primary" />
                        <span className="font-semibold">Custom Label</span>
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => setStep('upload-data')} disabled={!labelType}>Next</Button>
            </DialogFooter>
        </>
    );

    const renderUploadData = () => (
        <>
            <DialogHeader>
                <DialogTitle>Provide Your Data</DialogTitle>
                <DialogDescription>
                    Upload a data file or paste JSON to populate your labels.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload File</TabsTrigger>
                        <TabsTrigger value="paste"><ClipboardPaste className="mr-2 h-4 w-4" /> Paste JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                         <div className="flex items-center justify-center w-full mt-4">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    {fileName ? (
                                        <p className="text-sm text-foreground">{fileName}</p>
                                    ) : (
                                        <>
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">CSV, XLS, XLSX or JSON</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .json" />
                            </label>
                        </div>
                    </TabsContent>
                    <TabsContent value="paste">
                        <Textarea 
                            placeholder='{ "product_name": "My Awesome Product", "price": "$19.99" }'
                            rows={8}
                            className="mt-4"
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                setFileName(null); // Clear file if pasting
                            }}
                        />
                    </TabsContent>
                </Tabs>
               
                <p className="text-xs text-center text-muted-foreground">
                    Don&apos;t have data? <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/dashboard/editor?template=${template.id}`)}>Skip and create manually.</Button>
                </p>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setStep('select-type')}>Back</Button>
                <Button asChild disabled={!fileName && !jsonInput}>
                    <Link href={`/dashboard/editor?template=${template.id}`}>Create Labels</Link>
                </Button>
            </DialogFooter>
        </>
    );

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'select-type' ? renderSelectType() : renderUploadData()}
      </DialogContent>
    </Dialog>
  );
}
