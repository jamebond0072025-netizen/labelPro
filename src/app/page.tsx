
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { UseTemplateDialog } from '@/components/use-template-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { setPlaceHolderImages } from '@/lib/placeholder-images';
import { fetchWithAuth } from '@/lib/api';
import { USE_AUTH } from '@/lib/config';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const [templates, setTemplates] = useState<ImagePlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, tenantId } = useAuth();

  const fetchTemplates = (authCreds: { token: string | null, tenantId: string | null }) => {
      setIsLoading(true);
      setError(null);
      
      fetchWithAuth('LabelTemplate', authCreds)
      .then(response => {
        if (!response.ok) {
           if (response.status === 401 && USE_AUTH) {
             // If auth fails, useAuth hook will handle re-requesting credentials
             throw new Error("Authentication failed. Please log in and try again.");
           }
          throw new Error(`API error. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data || !Array.isArray(data)) {
           throw new Error("Received invalid data format from API.");
        }
        const formattedTemplates = data.map((item: any) => ({
            id: `template-${item.id}`,
            description: item.name,
            imageUrl: item.previewImageUrl || `https://picsum.photos/seed/${item.id}/300/420`,
            imageHint: item.name,
            width: item.width || 300,
            height: item.height || 420,
            designJson: item.designJson,
        }));
        setTemplates(formattedTemplates);
        setPlaceHolderImages(formattedTemplates);
      })
      .catch(err => {
        console.error("Failed to fetch templates:", err);
        setError(err.message || "Failed to load templates. Please ensure you have access.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // This effect runs when auth is enabled and we get the credentials
    if (USE_AUTH && token && tenantId) {
      fetchTemplates({ token, tenantId });
    }
  }, [token, tenantId]);

  useEffect(() => {
    // This effect runs once on mount if auth is disabled
    if (!USE_AUTH) {
        fetchTemplates({ token: null, tenantId: 'dummy-tenant-id' }); // Tenant ID might still be needed
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [useTemplate, setUseTemplate] = useState<ImagePlaceholder | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const templatesToShow = filteredTemplates.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };

  const handleUse = (template: ImagePlaceholder) => {
    setUseTemplate(template);
  };


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
                  <h3 className="text-lg font-bold">Authentication Error</h3>
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
                                        src={template.imageUrl}
                                        alt={template.description}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={template.imageHint}
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                        <Button size="sm" onClick={() => handleUse(template)} className="w-full">
                                            Use
                                        </Button>
                                        <div className="flex flex-col sm:flex-row w-full gap-2">
                                            <Button asChild size="sm" variant="secondary" className="w-full">
                                                <Link href={`/dashboard/editor?template=${template.id}`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 mt-auto">
                                    <h3 className="font-semibold text-sm truncate">{template.description}</h3>
                                    {template.width && template.height && (
                                        <p className="text-xs text-muted-foreground">{template.width}px x {template.height}px</p>

                                    )}
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
    </div>
  );
}
