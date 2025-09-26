
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Upload, ClipboardPaste, ArrowLeft, ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


interface UseTemplateDialogProps {
  template: ImagePlaceholder;
  onOpenChange: (isOpen: boolean) => void;
}

type Step = 'upload-data' | 'map-fields' | 'manual-data';

interface TemplatePlaceholder {
    key: string;
    type: 'text' | 'image' | 'barcode';
}

const ImageInput = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onChange(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Image URL or upload"
                className="h-8 flex-1"
            />
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="h-4 w-4" />
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>
    );
};


export function UseTemplateDialog({ template, onOpenChange }: UseTemplateDialogProps) {
    const router = useRouter();
    const { setTemplate, setData } = usePrint();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('upload-data');
    const [fileName, setFileName] = useState<string | null>(null);
    const [jsonInput, setJsonInput] = useState('');

    const [parsedData, setParsedData] = useState<Record<string, any>[] | null>(null);
    const [dataKeys, setDataKeys] = useState<string[]>([]);
    
    const [templatePlaceholders, setTemplatePlaceholders] = useState<TemplatePlaceholder[]>([]);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [manualData, setManualData] = useState<Record<string, any>[]>([{}]);


    const fetchTemplatePlaceholders = useCallback(async () => {
        if (!template.designJson) return;
        setIsLoadingTemplate(true);
        try {
            const templateData = typeof template.designJson === 'string' 
                ? JSON.parse(template.designJson) 
                : template.designJson;

            const placeholders = templateData.objects
                .filter((obj: CanvasObject): obj is CanvasObject & { key: string } => 'key' in obj && obj.key != null)
                .map((obj: any) => ({
                    key: obj.key,
                    type: obj.type,
                }));
            
            const uniquePlaceholders = Array.from(new Map(placeholders.map((p: any) => [p.key, p])).values());
            setTemplatePlaceholders(uniquePlaceholders);
            
            // Initialize manual data with keys
            const initialRow: Record<string, string> = {};
            uniquePlaceholders.forEach(p => initialRow[p.key] = '');
            setManualData([initialRow]);

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to load template',
                description: 'Could not parse template design.',
            });
        } finally {
            setIsLoadingTemplate(false);
        }
    }, [template.designJson, toast]);


    useEffect(() => {
        if ((step === 'map-fields' || step === 'manual-data') && templatePlaceholders.length === 0) {
            fetchTemplatePlaceholders();
        }
    }, [step, templatePlaceholders, fetchTemplatePlaceholders]);

    // Effect for automatic mapping
    useEffect(() => {
        if (templatePlaceholders.length > 0 && dataKeys.length > 0) {
            const initialMapping: Record<string, string> = {};
            templatePlaceholders.forEach(placeholder => {
                // Auto-map if a data key matches the placeholder key
                if (dataKeys.includes(placeholder.key)) {
                    initialMapping[placeholder.key] = placeholder.key;
                } else {
                    initialMapping[placeholder.key] = '';
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
                    const isMinorError = result.errors.every(e => e.code === 'TooFewFields' && e.row === result.data.length -1);
                    if (!isMinorError) {
                         const errorMessages = result.errors.map(e => `Row ${e.row}: ${e.message}`).join('\n');
                         throw new Error(errorMessages);
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
        let finalData: Record<string, any>[] | null = null;
        
        if(step === 'manual-data'){
            finalData = manualData.filter(row => Object.values(row).some(val => val !== ''));
            if(finalData.length === 0){
                toast({ variant: 'destructive', title: 'Empty Data', description: 'Please enter at least one row of data.'});
                return;
            }
        } else {
            if (!parsedData) {
                toast({ variant: 'destructive', title: 'Something went wrong', description: 'No data to process.'});
                return;
            }

            const isMappingComplete = templatePlaceholders.every(p => fieldMapping[p.key]);

            if (!isMappingComplete) {
                toast({ variant: 'destructive', title: 'Mapping Incomplete', description: 'Please map all template fields.'});
                return;
            }

            finalData = parsedData.map(originalRow => {
                const newRow: Record<string, any> = {};
                for (const templateKey in fieldMapping) {
                    const dataKey = fieldMapping[templateKey];
                    if (dataKey && originalRow.hasOwnProperty(dataKey)) {
                        newRow[templateKey] = originalRow[dataKey];
                    }
                }
                return newRow;
            });
        }
        
        if (finalData) {
            setData(finalData);
            setTemplate(template);
            router.push('/dashboard/print-preview');
        }
    }

    const handleMappingChange = (templateKey: string, dataKey: string) => {
        setFieldMapping(prev => ({...prev, [templateKey]: dataKey}));
    }

    const handleManualDataChange = (rowIndex: number, key: string, value: string) => {
        setManualData(prev => {
            const newData = [...prev];
            newData[rowIndex] = {...newData[rowIndex], [key]: value};
            return newData;
        });
    }

    const addManualRow = () => {
        const newRow: Record<string, string> = {};
        templatePlaceholders.forEach(p => newRow[p.key] = '');
        setManualData(prev => [...prev, newRow]);
    }

    const removeManualRow = (rowIndex: number) => {
        setManualData(prev => prev.filter((_, index) => index !== rowIndex));
    }


    const unmappedPlaceholders = useMemo(() => {
        return templatePlaceholders.filter(p => !fieldMapping[p.key]);
    }, [templatePlaceholders, fieldMapping]);

    const renderUploadData = () => (
        <>
            <DialogHeader>
                <DialogTitle>Use Template: {template.description}</DialogTitle>
                <DialogDescription>
                    Upload a data file (JSON, CSV, Excel) or paste JSON to populate your labels. The data should be an array of objects.
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
               
                <div className="text-center text-xs text-muted-foreground">
                    Don&apos;t have a file?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setStep('manual-data')}>
                        Add data manually
                    </Button>
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleNextToMap} disabled={!fileName && !jsonInput}>
                    Map Fields <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
        </>
    );

    const renderMapFields = () => (
         <>
            <DialogHeader>
                <DialogTitle>Map Fields for: {template.description}</DialogTitle>
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
                    <div key={placeholder.key} className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor={`map-${placeholder.key}`} className="text-right">
                           <code>{`{{${placeholder.key}}}`}</code>
                        </Label>
                        <Select
                            value={fieldMapping[placeholder.key]}
                            onValueChange={(value) => handleMappingChange(placeholder.key, value)}
                        >
                            <SelectTrigger id={`map-${placeholder.key}`}>
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

    const renderManualData = () => (
        <>
            <DialogHeader>
                <DialogTitle>Enter Data for: {template.description}</DialogTitle>
                <DialogDescription>
                   Add rows and fill in the data for each label you want to create.
                </DialogDescription>
            </DialogHeader>
             <div className="py-4 max-h-[60vh] overflow-y-auto">
                {isLoadingTemplate ? (
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {templatePlaceholders.map(p => <TableHead key={p.key}>{p.key}</TableHead>)}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {manualData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {templatePlaceholders.map(p => (
                                    <TableCell key={p.key}>
                                        {p.type === 'image' ? (
                                            <ImageInput
                                                value={row[p.key] || ''}
                                                onChange={(value) => handleManualDataChange(rowIndex, p.key, value)}
                                            />
                                        ) : (
                                            <Input 
                                                value={row[p.key] || ''}
                                                onChange={(e) => handleManualDataChange(rowIndex, p.key, e.target.value)}
                                                className="h-8"
                                            />
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeManualRow(rowIndex)} disabled={manualData.length === 1}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
                 <Button variant="outline" size="sm" onClick={addManualRow} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Row
                </Button>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('upload-data')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={handleCreateLabels} disabled={isLoadingTemplate}>
                    Create Labels
                </Button>
            </DialogFooter>
        </>
    );


  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", step === 'map-fields' && "sm:max-w-lg", step === 'manual-data' && "sm:max-w-4xl")}>
        {step === 'upload-data' && renderUploadData()}
        {step === 'map-fields' && renderMapFields()}
        {step === 'manual-data' && renderManualData()}
      </DialogContent>
    </Dialog>
  );
}
