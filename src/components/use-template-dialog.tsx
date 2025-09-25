
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Package, FileText, Upload, ClipboardPaste, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from './ui/textarea';
import { usePrint } from '@/contexts/print-context';
import { useToast } from '@/hooks/use-toast';
import type { CanvasObject } from '@/lib/types';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';


interface UseTemplateDialogProps {
  template: ImagePlaceholder;
  onOpenChange: (isOpen: boolean) => void;
}

type Step = 'select-type' | 'upload-data' | 'map-fields';
type LabelType = 'product' | 'custom' | null;


export function UseTemplateDialog({ template, onOpenChange }: UseTemplateDialogProps) {
    const router = useRouter();
    const { setTemplate, setData } = usePrint();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('select-type');
    const [labelType, setLabelType] = useState<LabelType>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [jsonInput, setJsonInput] = useState('');

    const [parsedData, setParsedData] = useState<Record<string, any>[] | null>(null);
    const [dataKeys, setDataKeys] = useState<string[]>([]);
    
    const [templatePlaceholders, setTemplatePlaceholders] = useState<string[]>([]);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);


    const fetchTemplatePlaceholders = useCallback(async () => {
        if (!template.templateUrl) return;
        setIsLoadingTemplate(true);
        try {
            const res = await fetch(template.templateUrl);
            const templateData: { objects: CanvasObject[] } = await res.json();
            const placeholders = templateData.objects
                .map(obj => 'key' in obj ? obj.key : null)
                .filter((key): key is string => key !== null && key !== undefined);
            
            const uniquePlaceholders = [...new Set(placeholders)];
            setTemplatePlaceholders(uniquePlaceholders);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Failed to load template',
                description: 'Could not fetch template placeholder keys.',
            });
            console.error(error);
        } finally {
            setIsLoadingTemplate(false);
        }
    }, [template.templateUrl, toast]);


    useEffect(() => {
        if (step === 'map-fields' && templatePlaceholders.length === 0) {
            fetchTemplatePlaceholders();
        }
    }, [step, templatePlaceholders, fetchTemplatePlaceholders]);

    // Effect for automatic mapping
    useEffect(() => {
        if (templatePlaceholders.length > 0 && dataKeys.length > 0) {
            const initialMapping: Record<string, string> = {};
            templatePlaceholders.forEach(placeholder => {
                // Auto-map if a data key matches the placeholder key
                if (dataKeys.includes(placeholder)) {
                    initialMapping[placeholder] = placeholder;
                } else {
                    initialMapping[placeholder] = '';
                }
            });
            setFieldMapping(initialMapping);
        }
    }, [templatePlaceholders, dataKeys]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const extension = file.name.split('.').pop()?.toLowerCase() || '';
            setFileName(file.name);
            setJsonInput(''); // Clear json input if a file is selected

            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                if (content) {
                    handleDataInput(content, extension);
                }
            };

            if (extension === 'xls' || extension === 'xlsx') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        }
    };

    const handleDataInput = (content: string | ArrayBuffer, extension: string) => {
        try {
            let data: Record<string, any>[] = [];
            if (extension === 'json') {
                data = JSON.parse(content as string);
            } else if (extension === 'csv') {
                const result = Papa.parse(content as string, { header: true, skipEmptyLines: true });
                if (result.errors.length > 0) {
                    const isMinorError = result.errors.every(e => e.code === 'TooFewFields' && e.row === result.data.length);
                    if (!isMinorError) {
                        throw new Error(result.errors.map(e => e.message).join(', '));
                    }
                }
                data = result.data as Record<string, any>[];
            } else if (extension === 'xls' || extension === 'xlsx') {
                const workbook = XLSX.read(content, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'File type not supported',
                    description: 'Please upload a JSON, CSV, or Excel file.',
                })
                setParsedData(null);
                setDataKeys([]);
                return;
            }

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("Data must be a non-empty array of objects.");
            }

            setParsedData(data);
            setDataKeys(Object.keys(data[0]));
             if(extension !== 'json'){
              setJsonInput(JSON.stringify(data, null, 2));
            } else {
              setJsonInput(content as string);
            }
            return data; // Return data for immediate use

        } catch (error) {
            const e = error as Error;
            toast({
                variant: 'destructive',
                title: 'Invalid Data',
                description: e.message || 'Please check your data format.',
            });
            setParsedData(null);
            setDataKeys([]);
            return null; // Return null on error
        }
    }
    
    const handleNextToMap = () => {
        let currentData = parsedData;
        if (!currentData) {
            if (jsonInput) {
                currentData = handleDataInput(jsonInput, 'json');
                 if(!currentData) return; // Stop if parsing failed
            } else {
                toast({
                    variant: 'destructive',
                    title: 'No Data Provided',
                    description: 'Please upload or paste data to proceed.',
                });
                return;
            }
        }
        setStep('map-fields');
    }

    const handleCreateLabels = () => {
        if (!parsedData) {
             toast({ variant: 'destructive', title: 'Something went wrong', description: 'No data to process.'});
             return;
        }

        const isMappingComplete = Object.values(fieldMapping).every(v => v !== '');

        if (!isMappingComplete) {
            toast({ variant: 'destructive', title: 'Mapping Incomplete', description: 'Please map all template fields.'});
            return;
        }

        const transformedData = parsedData.map(originalRow => {
            const newRow: Record<string, any> = {};
            for (const templateKey in fieldMapping) {
                const dataKey = fieldMapping[templateKey];
                if (dataKey && originalRow.hasOwnProperty(dataKey)) {
                    newRow[templateKey] = originalRow[dataKey];
                }
            }
            return newRow;
        });
        
        setData(transformedData);
        setTemplate(template);
        router.push('/dashboard/print-preview');
    }

    const handleMappingChange = (templateKey: string, dataKey: string) => {
        setFieldMapping(prev => ({...prev, [templateKey]: dataKey}));
    }

    const unmappedPlaceholders = useMemo(() => {
        return templatePlaceholders.filter(p => !fieldMapping[p]);
    }, [templatePlaceholders, fieldMapping]);

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
                <Button onClick={() => setStep('upload-data')} disabled={!labelType}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </DialogFooter>
        </>
    );

    const renderUploadData = () => (
        <>
            <DialogHeader>
                <DialogTitle>Provide Your Data</DialogTitle>
                <DialogDescription>
                    Upload a data file (JSON, CSV, Excel) or paste JSON to populate your labels. The data should be an array of objects.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Tabs defaultValue="paste" className="w-full">
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
                                        <p className="text-xs text-muted-foreground">JSON, CSV, XLS, XLSX</p>
                                        </>
                                    )}
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".json,.csv,.xls,.xlsx" />
                            </label>
                        </div>
                    </TabsContent>
                    <TabsContent value="paste">
                        <Textarea 
                            placeholder='[{"product_name": "My Awesome Product", "price": "$19.99"}]'
                            rows={8}
                            className="mt-4"
                            value={jsonInput}
                            onChange={(e) => {
                                setJsonInput(e.target.value);
                                setFileName(null);
                                setParsedData(null);
                                setDataKeys([]);
                            }}
                        />
                    </TabsContent>
                </Tabs>
               
                <p className="text-xs text-center text-muted-foreground">
                    Don&apos;t have data? <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/dashboard/editor?template=${template.id}`)}>Edit template directly.</Button>
                </p>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setStep('select-type')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={handleNextToMap} disabled={!fileName && !jsonInput}>
                    Map Fields <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
        </>
    );

    const renderMapFields = () => (
         <>
            <DialogHeader>
                <DialogTitle>Map Your Data Fields</DialogTitle>
                <DialogDescription>
                    Match the placeholders in your template to the fields from your data source. Fields with matching names have been pre-selected.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {isLoadingTemplate ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : templatePlaceholders.map(placeholder => (
                    <div key={placeholder} className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor={`map-${placeholder}`} className="text-right">
                           <code>{`{{${placeholder}}}`}</code>
                        </Label>
                        <Select
                            value={fieldMapping[placeholder]}
                            onValueChange={(value) => handleMappingChange(placeholder, value)}
                        >
                            <SelectTrigger id={`map-${placeholder}`}>
                                <SelectValue placeholder="Select a data field..." />
                            </SelectTrigger>
                            <SelectContent>
                                {dataKeys.map(key => (
                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
                 {unmappedPlaceholders.length > 0 && (
                    <p className="text-xs text-destructive text-center pt-2">
                        You have {unmappedPlaceholders.length} unmapped field(s).
                    </p>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('upload-data')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={handleCreateLabels} disabled={unmappedPlaceholders.length > 0 || isLoadingTemplate}>
                    Create Labels
                </Button>
            </DialogFooter>
        </>
    );

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", step === 'map-fields' && "sm:max-w-lg")}>
        {step === 'select-type' && renderSelectType()}
        {step === 'upload-data' && renderUploadData()}
        {step === 'map-fields' && renderMapFields()}
      </DialogContent>
    </Dialog>
  );
}

    