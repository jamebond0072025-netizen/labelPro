

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
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
import { getMockTemplates, deleteMockTemplate } from '@/lib/mock-api';
import { apiCall } from '@/lib/api';


export default function Home() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { token, tenantId } = useAuth();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Template[];
      if (USE_DUMMY_TEMPLATES) {
        data = await getMockTemplates();
      } else {
        const response = await apiCall({ url: '/LabelTemplate', method: 'GET' }, { token, tenantId });
        data = response.data;
      }

      if (!data || !Array.isArray(data)) {
        throw new Error("Received invalid data format.");
      }
      
      const parsedData = data.map(t => {
        try {
          const design = typeof t.designJson === 'string' ? JSON.parse(t.designJson) : t.designJson;
          return { ...t, designJson: design };
        } catch (e) {
          console.warn(`Could not parse designJson for template ${t.id}`, t.designJson);
          return { ...t, designJson: { settings: {}, objects: [] } };
        }
      });

      setTemplates(parsedData);

      const formattedPlaceholders = parsedData.map((item: Template) => ({
        id: `template-${item.id}`,
        description: item.name,
        imageUrl: item.previewImageUrl || `https://picsum.photos/seed/${item.id}/300/420`,
        imageHint: item.name,
        designJson: item.designJson,
        template: item,
      }));
      setPlaceHolderImages(formattedPlaceholders);

    } catch (err: any) {
      console.error("Failed to fetch templates:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load templates. Please ensure you have access.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, tenantId]);

  useEffect(() => {
    if ((USE_AUTH && token && tenantId) || !USE_AUTH) {
      fetchTemplates();
    }
  }, [token, tenantId, fetchTemplates]);


  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [useTemplate, setUseTemplate] = useState<ImagePlaceholder | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);


  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const templatesToShow = filteredTemplates.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };

  const handleUse = (template: Template) => {
    const placeholder = {
        id: `template-${template.id}`,
        description: template.name,
        imageUrl: template.previewImageUrl || `https://picsum.photos/seed/${template.id}/300/420`,
        imageHint: template.name,
        designJson: template.designJson,
        template: template,
    };
    setUseTemplate(placeholder);
  };

  const handleDelete = async () => {
      if (!deletingTemplate) return;

      try {
          if (USE_DUMMY_TEMPLATES) {
              await deleteMockTemplate(deletingTemplate.id);
          } else {
              await apiCall({ url: `/LabelTemplate/${deletingTemplate.id}`, method: 'DELETE' }, { token, tenantId });
          }
          toast({ title: 'Template Deleted', description: `"${deletingTemplate.name}" has been deleted.` });
          setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
      } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || "Could not delete template.";
          toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      } finally {
          setDeletingTemplate(null);
      }
  }


  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1">
        <div className="container w-full px-4 md:px-6 py-8">
            {isLoading ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                      <div className="space-y-2">
                           <Skeleton className="h-10 w-64" />
                           <Skeleton className="h-6 w-96" />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <Skeleton className="h-10 w-full sm:w-[300px]" />
                        <Skeleton className="h-11 w-full sm:w-[180px]" />
                      </div>
                  </div>
                  <div className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-0">
                          <Skeleton className="aspect-[10/14] w-full" />
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
            ) : error ? (
                <div className="mt-12 text-center text-destructive border border-destructive/50 bg-destructive/10 p-6 rounded-lg max-w-2xl mx-auto">
                  <h3 className="text-lg font-bold">Error</h3>
                  <p className="mt-2">{error}</p>
                </div>
            ) : (
              <section id="templates" className="w-full">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Templates</h1>
                        <p className="text-muted-foreground md:text-lg/relaxed">
                            Kickstart your project with one of our professionally designed templates.
                        </p>
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
                <div className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {templatesToShow.map(template => (
                        <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                            <CardContent className="p-0 flex flex-col flex-1">
                                <div className="relative aspect-[10/14] w-full">
                                    <Image
                                        src={template.previewImageUrl || `https://picsum.photos/seed/${template.id}/300/420`}
                                        alt={template.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={template.name}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                        <Button size="sm" onClick={() => handleUse(template)} className="w-full">
                                            Use
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
                                <div className="p-3 mt-auto">
                                    <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{template.description || 'No description'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {visibleCount < filteredTemplates.length && (
                    <div className="mt-12 text-center">
                        <Button onClick={handleLoadMore}>Load More Templates</Button>
                    </div>
                )}
                {filteredTemplates.length === 0 && !isLoading && (
                    <div className="mt-12 text-center text-muted-foreground">
                        No templates found for &quot;{searchQuery}&quot;.
                    </div>
                )}
              </section>
            )}
        </div>
      </main>

      {useTemplate && (
        <UseTemplateDialog
          template={useTemplate}
          onOpenChange={(isOpen) => !isOpen && setUseTemplate(null)}
        />
      )}

      {deletingTemplate && (
        <AlertDialog open onOpenChange={() => setDeletingTemplate(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the template &quot;{deletingTemplate.name}&quot;. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
