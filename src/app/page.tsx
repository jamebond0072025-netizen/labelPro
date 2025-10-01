
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, MoreVertical, Loader2, Expand } from 'lucide-react';
import { UseTemplateDialog } from '@/components/use-template-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { setPlaceHolderImages } from '@/lib/placeholder-images';
import { USE_AUTH, USE_DUMMY_TEMPLATES } from '@/lib/config';
import { useAuth } from '@/hooks/use-auth';
import type { Template } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { getMockTemplates, deleteMockTemplate } from '@/lib/mock-api';
import { apiCall } from '@/lib/api';
import { Badge } from '@/components/ui/badge';


// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// In-memory cache for templates
let templateCache: Template[] | null = null;

export default function Home() {
  const [templates, setTemplates] = useState<Template[]>(templateCache || []);
  const [isLoading, setIsLoading] = useState(!templateCache); // Only show main loader if cache is empty
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { token, tenantId } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const IMAGE_URL = `https://crossbiz-api.apexpath.com/inventory-service/images/labeltemplates/`;

  function transformLabelTemplate(original: any): Template {
    return {
      id: original.Id,
      userId: original.UserId,
      name: original.labelName,
      description: original.Description ?? '',
      category: original.Category ?? '',
      designJson: original.DesignJson,
      bulkDataJson: original.BulkDataJson,
      previewImageUrl: original.PreviewImageUrl,
      createdAt: original.CreatedAt,
      updatedAt: original.UpdatedAt,
    };
  }

  const fetchTemplates = useCallback(async (query: string, pageNum: number, isNewSearch: boolean) => {
    if (isNewSearch && !templateCache) {
      setIsLoading(true);
    } else if (!isNewSearch) {
      setIsFetchingMore(true);
    }
    setError(null);

    try {
      let data: Template[] = [];
      const pageSize = 10;

      if (USE_DUMMY_TEMPLATES) {
        let allMockTemplates = await getMockTemplates();
        if (query) {
          allMockTemplates = allMockTemplates.filter(t => 
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            (t.category && t.category.toLowerCase().includes(query.toLowerCase()))
          );
        }
        const paginatedData = allMockTemplates.slice((pageNum - 1) * pageSize, pageNum * pageSize);
        data = paginatedData;
        setHasMore(pageNum * pageSize < allMockTemplates.length);
      } else {
        const tableId = "LabelTemplate-Info";
        const endpoint = `/Inventory/global/${tableId}`;
        
        let additionalWhere = "";
        if (query) {
          additionalWhere = `(labelName LIKE '%${query}%' OR Category LIKE '%${query}%')`;
        }
        
        const params = {
          columns: "*",
          pageNumber: pageNum,
          pageSize,
          sortData: "",
          searchParams: JSON.stringify([]),
          tableName: tableId,
          sortBy: "DESC",
          additionalWhere,
          qID: 0,
        };

        const response = await apiCall({ url: endpoint, method: 'POST', data: params }, { token, tenantId });
        
        if (!response.data || !Array.isArray(response.data.results)) {
            throw new Error("Received invalid data format.");
        }
        data = response.data.results.map(transformLabelTemplate);
        setHasMore(data.length === pageSize);
      }
      
      const parsedData = data.map(t => {
        try {
          let design = t.designJson;
          if (typeof design === 'string') {
            try { design = JSON.parse(design); } catch (e) { design = {}; }
          }
          if (typeof design === 'string') { // Double parse attempt
             try { design = JSON.parse(design); } catch (e) { design = {}; }
          }

          let previewImageUrl = t.previewImageUrl ? `${IMAGE_URL}${tenantId}/${t.previewImageUrl}` : `https://picsum.photos/seed/${t.id}/300/420`;
          if (t.previewImageUrl && t.previewImageUrl.startsWith('data:image')) {
            previewImageUrl = t.previewImageUrl;
          } else if (t.previewImageUrl) {
             previewImageUrl =  `${IMAGE_URL}${tenantId}/${t.previewImageUrl}`;
             if (t.updatedAt) {
                previewImageUrl += `?updated=${new Date(t.updatedAt).getTime()}`;
             }
          }
     
          return { ...t, designJson: design, previewImageUrl };
        } catch (e) {
          console.warn(`Could not parse designJson for template ${t.id}`);
          return { ...t, designJson: { settings: {}, objects: [] }, previewImageUrl: `https://picsum.photos/seed/${t.id}/300/420` };
        }
      });
      
      if (isNewSearch) {
        setTemplates(parsedData);
        if(query === ''){
           templateCache = parsedData;
        }
      } else {
        const newTemplates = [...templates, ...parsedData];
        setTemplates(newTemplates);
        if(query === ''){
            templateCache = newTemplates;
        }
      }

      setPlaceHolderImages(parsedData.map((item: Template) => ({
        id: `template-${item.id}`,
        description: item.name,
        imageUrl: item.previewImageUrl || `https://picsum.photos/seed/${item.id}/300/420`,
        imageHint: item.name,
        designJson: item.designJson,
        template: item,
      })));

    } catch (err: any) {
      console.error("Failed to fetch templates:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load templates.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [token, tenantId, templates]);


  useEffect(() => {
    if ((USE_AUTH && token && tenantId) || !USE_AUTH) {
        setPage(1);
        fetchTemplates(debouncedSearchQuery, 1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, token, tenantId]);

  const [useTemplate, setUseTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(debouncedSearchQuery, nextPage, false);
  };

  const handleUse = (template: Template) => {
    setUseTemplate(template);
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      if (USE_DUMMY_TEMPLATES) {
        await deleteMockTemplate(deletingTemplate.id);
      } else {
        await apiCall({ url: `/LabelTemplate/${deletingTemplate.id}`, method: 'DELETE' }, { token, tenantId });
      }
      toast({ title: 'Template Deleted', description: `"${deletingTemplate.name}" has been deleted.` });
      
      const newTemplates = templates.filter(t => t.id !== deletingTemplate.id);
      setTemplates(newTemplates);
      templateCache = newTemplates;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Could not delete template.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    } finally {
      setIsDeleting(false);
      setDeletingTemplate(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1">
        <div className="container max-w-none px-4 md:px-6 py-8">
            <section id="templates" className="w-full">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <div className="space-y-2">
                      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Templates</h1>
                      
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search templates..."
                        className="pl-8 sm:w-[200px] md:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/dashboard/editor"><Plus className="mr-2 h-5 w-5" /> Create New Design</Link>
                    </Button>
                  </div>
              </div>

              {isLoading ? (
                  <div className="mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-0">
                          <Skeleton className="aspect-[3/4] w-full" />
                          <div className="p-3 space-y-2">
                             <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
              ) : error ? (
                  <div className="mt-12 text-center text-destructive border border-destructive/50 bg-destructive/10 p-6 rounded-lg max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold">Error</h3>
                    <p className="mt-2">{error}</p>
                  </div>
              ) : (
                <>
                  <div className="mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {templates.map(template => (
                          <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                              <CardContent className="p-0 flex flex-col flex-1">
                                  <div className="relative aspect-[1] w-full bg-muted/30">
                                      <Image
                                          src={template.previewImageUrl || `https://picsum.photos/seed/${template.id}/300/420`}
                                          alt={template.name}
                                          fill
                                          className="object-contain transition-transform duration-300 group-hover:scale-105 p-2"
                                          data-ai-hint={template.name}
                                          unoptimized
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                          <Button size="sm" onClick={() => handleUse(template)} className="w-full">
                                              Use
                                          </Button>
                                          <Button size="sm" variant="secondary" onClick={() => setEnlargedImage(template.previewImageUrl || '')} className="w-full">
                                              <Expand className="mr-2 h-4 w-4" />
                                              Preview
                                          </Button>
                                      </div>
                                      <div className="absolute top-1 right-1">
                                          <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                  <Button variant="secondary" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                      <MoreVertical className="h-4 w-4" />
                                                  </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                  <DropdownMenuItem asChild>
                                                      <Link href={`/dashboard/editor?templateId=${template.id}`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setDeletingTemplate(template)} className="text-destructive">
                                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                  </DropdownMenuItem>
                                              </DropdownMenuContent>
                                          </DropdownMenu>
                                      </div>
                                  </div>
                                  <div className="p-3 mt-auto space-y-1">
                                      {template.category && (
                                          <Badge variant="secondary" className="font-normal">{template.category}</Badge>
                                      )}
                                      <h3 className="font-semibold text-sm truncate pt-1">{template.name}</h3>
                                      <p className="text-xs text-muted-foreground truncate">{template.description || 'No description'}</p>
                                  </div>
                              </CardContent>
                          </Card>
                      ))}
                  </div>
                  {hasMore && (
                      <div className="mt-12 text-center">
                          <Button onClick={handleLoadMore} disabled={isFetchingMore}>
                            {isFetchingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isFetchingMore ? 'Loading...' : 'Load More Templates'}
                          </Button>
                      </div>
                  )}
                  {templates.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center mt-20 text-center space-y-6">
                      {/* Icon */}
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">No templates found</h2>
                        <p className="text-muted-foreground">
                          Get started by creating your first design template.
                        </p>
                      </div>

                      {/* Button */}
                      <Button asChild size="lg" className="px-6">
                        <Link href="/dashboard/editor">
                          <Plus className="mr-2 h-5 w-5" /> Create New Design
                        </Link>
                      </Button>
                    </div>
                  )}

                </>
              )}
            </section>
        </div>
      </main>

      {useTemplate && (
        <UseTemplateDialog
          template={useTemplate}
          onOpenChange={(isOpen) => !isOpen && setUseTemplate(null)}
        />
      )}

      {deletingTemplate && (
        <AlertDialog open onOpenChange={(isOpen) => !isOpen && setDeletingTemplate(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the template &quot;{deletingTemplate.name}&quot;. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
                       {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

       {enlargedImage && (
        <Dialog open onOpenChange={() => setEnlargedImage(null)}>
          <DialogContent className="max-w-2xl">
             <Image
                src={enlargedImage}
                alt="Enlarged template preview"
                width={800}
                height={1120}
                className="w-full h-auto object-contain rounded-lg"
                unoptimized
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
