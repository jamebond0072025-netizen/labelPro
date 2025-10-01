
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
import type { Template, QRCodeObject } from "@/lib/types"
import { useRouter } from 'next/navigation';
import { Upload, ClipboardPaste, ArrowLeft, ArrowRight, PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
import { useMediaQuery } from '@/hooks/use-media-query';

interface UseTemplateDialogProps {
  template: Template;
  onOpenChange: (isOpen: boolean) => void;
}

type Step = 'upload-data' | 'map-fields' | 'manual-data';

interface TemplatePlaceholder {
    key: string;
    type: 'text' | 'image' | 'barcode' | 'qrcode';
    qrCodeType?: 'text' | 'url' | 'phone' | 'email' | 'whatsapp' | 'location';
}

const ImageInput = ({ value, onChange }: { value: string; onChange: (value: string) => void; }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsProcessing(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                onChange(dataUrl);
                setIsProcessing(false);
            };
            reader.onerror = () => {
                setIsProcessing(false);
                // You might want to add a toast notification for the error here
                console.error("Failed to read file.");
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
                disabled={isProcessing}
            />
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
            >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageFileChange}
            />
        </div>
    );
};


export function UseTemplateDialog({ template, onOpenChange }: UseTemplateDialogProps) {
    const router = useRouter();
    const { setTemplate, setData } = usePrint();
    const { toast } = useToast();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const [step, setStep] = useState<Step>('upload-data');
    const [fileName, setFileName] = useState<string | null>(null);
    const [jsonInput, setJsonInput] = useState('');

    const [parsedData, setParsedData] = useState<Record<string, any>[] | null>(null);
    const [dataKeys, setDataKeys] = useState<string[]>([]);
    
    const [templatePlaceholders, setTemplatePlaceholders] = useState<TemplatePlaceholder[]>([]);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [isCreatingLabels, setIsCreatingLabels] = useState(false);
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [manualData, setManualData] = useState<Record<string, any>[]>([{}]);


    const fetchTemplatePlaceholders = useCallback(async () => {
        if (!template.designJson) return;
        setIsLoadingTemplate(true);
        try {
            const templateData = typeof template.designJson === 'string' 
                ? JSON.parse(template.designJson) 
                : template.designJson;

            const placeholders = (templateData.objects as CanvasObject[])
                .filter((obj): obj is CanvasObject & { key: string } => 'key' in obj && !!obj.key)
                .map((obj: any) => {
                    const placeholder: TemplatePlaceholder = {
                        key: obj.key,
                        type: obj.type,
                    };
                    if (obj.type === 'qrcode') {
                        placeholder.qrCodeType = (obj as QRCodeObject).qrCodeType;
                    }
                    return placeholder;
                });
            
            const uniquePlaceholders = Array.from(new Map(placeholders.map((p: any) => [p.key, p])).values());
            setTemplatePlaceholders(uniquePlaceholders);
            
            // Initialize manual data with keys
            const initialRow: Record<string, any> = {};
            uniquePlaceholders.forEach(p => {
                 if (p.type === 'qrcode' && p.qrCodeType !== 'text' && p.qrCodeType !== 'phone' && p.qrCodeType !== 'url') {
                    initialRow[p.key] = {}; // Initialize as object for complex types
                } else {
                    initialRow[p.key] = '';
                }
            });
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
        setIsCreatingLabels(true);
        let finalData: Record<string, any>[] | null = null;
        
        if(step === 'manual-data'){
            finalData = manualData.filter(row => Object.values(row).some(val => val !== '' && (typeof val !== 'object' || Object.values(val).some(subVal => subVal !== ''))));
            if(finalData.length === 0){
                toast({ variant: 'destructive', title: 'Empty Data', description: 'Please enter at least one row of data.'});
                setIsCreatingLabels(false);
                return;
            }
        } else {
            if (!parsedData) {
                toast({ variant: 'destructive', title: 'Something went wrong', description: 'No data to process.'});
                setIsCreatingLabels(false);
                return;
            }

            const isMappingComplete = templatePlaceholders.every(p => fieldMapping[p.key]);

            if (!isMappingComplete) {
                toast({ variant: 'destructive', title: 'Mapping Incomplete', description: 'Please map all template fields.'});
                setIsCreatingLabels(false);
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
        } else {
            setIsCreatingLabels(false);
        }
    }

    const handleMappingChange = (templateKey: string, dataKey: string) => {
        setFieldMapping(prev => ({...prev, [templateKey]: dataKey}));
    }

    const handleManualDataChange = (rowIndex: number, key: string, value: string | Record<string, string>, subKey?: string) => {
        setManualData(prev => {
            const newData = [...prev];
            const newRow = { ...newData[rowIndex] };
            if (subKey) {
                newRow[key] = { ...(newRow[key] || {}), [subKey]: value };
            } else {
                newRow[key] = value;
            }
            newData[rowIndex] = newRow;
            return newData;
        });
    }

    const addManualRow = () => {
        const newRow: Record<string, any> = {};
        templatePlaceholders.forEach(p => {
             if (p.type === 'qrcode' && p.qrCodeType !== 'text' && p.qrCodeType !== 'url' && p.qrCodeType !== 'phone') {
                newRow[p.key] = {};
            } else {
                newRow[p.key] = '';
            }
        });
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
                <DialogTitle>Use Template: {template.name}</DialogTitle>
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
                <DialogTitle>Map Fields for: {template.name}</DialogTitle>
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
                <Button onClick={handleCreateLabels} disabled={unmappedPlaceholders.length > 0 || isLoadingTemplate || isCreatingLabels}>
                    {isCreatingLabels && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreatingLabels ? 'Creating...' : 'Create Labels'}
                </Button>
            </DialogFooter>
        </>
    );
    
    const getPlaceholderLabel = (placeholder: TemplatePlaceholder) => {
        if (placeholder.type === 'qrcode' && placeholder.qrCodeType) {
            return `${placeholder.key} (${placeholder.qrCodeType})`;
        }
        return placeholder.key;
    };


     const renderManualDataInputs = (placeholder: TemplatePlaceholder, rowIndex: number, row: Record<string, any>) => {
        if (placeholder.type === 'image') {
            return (
                <ImageInput
                    value={row[placeholder.key] || ''}
                    onChange={(value) => handleManualDataChange(rowIndex, placeholder.key, value)}
                />
            );
        }

        if (placeholder.type === 'qrcode' && placeholder.qrCodeType) {
            switch(placeholder.qrCodeType) {
                case 'email':
                    return <div className="space-y-2">
                        <Input placeholder="Email" value={row[placeholder.key]?.email || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'email')} className="h-8" />
                        <Input placeholder="Subject" value={row[placeholder.key]?.subject || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'subject')} className="h-8" />
                        <Textarea placeholder="Body" value={row[placeholder.key]?.body || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'body')} rows={2} />
                    </div>;
                case 'whatsapp':
                    return <div className="space-y-2">
                        <Input placeholder="Phone Number" value={row[placeholder.key]?.phone || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'phone')} className="h-8" />
                        <Textarea placeholder="Message" value={row[placeholder.key]?.message || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'message')} rows={2} />
                    </div>;
                case 'location':
                    return <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Latitude" value={row[placeholder.key]?.latitude || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'latitude')} className="h-8" />
                        <Input placeholder="Longitude" value={row[placeholder.key]?.longitude || ''} onChange={e => handleManualDataChange(rowIndex, placeholder.key, e.target.value, 'longitude')} className="h-8" />
                    </div>;
                case 'url':
                case 'phone':
                case 'text':
                default:
                     return <Input value={row[placeholder.key] || ''} onChange={(e) => handleManualDataChange(rowIndex, placeholder.key, e.target.value)} className="h-8" />;
            }
        }

        return <Input value={row[placeholder.key] || ''} onChange={(e) => handleManualDataChange(rowIndex, placeholder.key, e.target.value)} className="h-8" />;
    };


    const renderManualDataDesktop = () => (
         <Table>
            <TableHeader>
                <TableRow>
                    {templatePlaceholders.map(p => <TableHead key={p.key}>{getPlaceholderLabel(p)}</TableHead>)}
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {manualData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {templatePlaceholders.map(p => (
                            <TableCell key={p.key}>
                                {renderManualDataInputs(p, rowIndex, row)}
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
    );

    const renderManualDataMobile = () => (
        <div className="space-y-4">
            {manualData.map((row, rowIndex) => (
                <div key={rowIndex} className="border rounded-lg p-4 space-y-4 relative">
                    <h4 className="font-semibold">Label #{rowIndex + 1}</h4>
                     {templatePlaceholders.map(p => (
                        <div key={p.key} className="space-y-2">
                            <Label htmlFor={`manual-${rowIndex}-${p.key}`}>{getPlaceholderLabel(p)}</Label>
                            {renderManualDataInputs(p, rowIndex, row)}
                        </div>
                    ))}
                    {manualData.length > 1 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => removeManualRow(rowIndex)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Label
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );

    const renderManualData = () => (
        <>
            <DialogHeader>
                <DialogTitle>Enter Data for: {template.name}</DialogTitle>
                <DialogDescription>
                   Add rows and fill in the data for each label you want to create.
                </DialogDescription>
            </DialogHeader>
             <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoadingTemplate ? (
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : isMobile ? renderManualDataMobile() : renderManualDataDesktop()
                }
                 <Button variant="outline" size="sm" onClick={addManualRow} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Row
                </Button>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep('upload-data')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={handleCreateLabels} disabled={isLoadingTemplate || isCreatingLabels}>
                     {isCreatingLabels && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreatingLabels ? 'Creating...' : 'Create Labels'}
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

    
    