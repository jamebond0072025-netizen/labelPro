
'use client';

import Link from 'next/link';
import { Type } from 'lucide-react';
import { useEditor } from '@/contexts/editor-context';
import { usePrint } from '@/contexts/print-context';
import { useToast } from '@/hooks/use-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { SaveTemplateDialog } from '../save-template-dialog';
import type { Template } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 print-hidden">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
              <ChevronLeft className="h-6 w-6 text-primary" />      
              <span className="font-semibold font-headline">Back</span>
          </Link>
        </div>

        <div className="flex-1">
        </div>
        
        {isEditor && (
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Load
              </Button>
               <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
              <Button variant="outline" size="sm" onClick={() => setIsSaveDialogOpen(true)}>
                <Save className="mr-2 h-4 w-4" />
                {templateId ? 'Update' : 'Save'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('png')}>
                    <ImageIcon className="mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('jpeg')}>
                    <ImageIcon className="mr-2" />
                    Export as JPEG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        )}

        {isPrintPreview && (
          <Button onClick={handleDownloadPdf} disabled={isPrinting}>
            {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
            {isPrinting ? 'Generating...' : 'Download PDF'}
          </Button>
        )}
      </header>
      {isSaveDialogOpen && editorState && (
        <SaveTemplateDialog
          isOpen={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          editorState={editorState}
          existingTemplate={existingTemplate}
        />
      )}
    </>
  );
}
