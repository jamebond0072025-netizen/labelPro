
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

const USE_DUMMY_TEMPLATES = process.env.NEXT_PUBLIC_USE_DUMMY_TEMPLATES === 'true';

const dummyTemplates = [
    {
        "id": 1,
        "userId": "2f77522d-48bf-458b-d8e9-08dd34668e41",
        "name": "Product Label1",
        "description": "Label for packaging products",
        "category": "Packaging",
        "designJson": "{\\\"font\\\":\\\"Arial\\\",\\\"size\\\":12}",
        "bulkDataJson": "[{\\\"ProductName\\\":\\\"Apple\\\",\\\"Price\\\":100},{\\\"ProductName\\\":\\\"Banana\\\",\\\"Price\\\":50}]",
        "previewImageUrl": "Product-Label1.jpg",
        "createdAt": "2025-09-24T13:01:08.503",
        "updatedAt": "2025-09-24T13:05:27.227"
    },
    {
        "id": 2,
        "userId": "2f77522d-48bf-458b-d8e9-08dd34668e41",
        "name": "Coffee Bag Label",
        "description": "test1",
        "category": "test1",
        "designJson": "{\\\"settings\\\":{\\\"width\\\":350,\\\"height\\\":500,\\\"backgroundColor\\\":\\\"#FDFBF5\\\"},\\\"objects\\\":[{\\\"id\\\":\\\"text1\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":25,\\\"y\\\":40,\\\"width\\\":300,\\\"height\\\":50,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{brand_name}}\\\",\\\"fontSize\\\":36,\\\"fontWeight\\\":\\\"bold\\\",\\\"fontFamily\\\":\\\"Poppins, sans-serif\\\",\\\"color\\\":\\\"#3A2419\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"brand_name\\\"},{\\\"id\\\":\\\"text2\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":25,\\\"y\\\":120,\\\"width\\\":300,\\\"height\\\":30,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{coffee_name}}\\\",\\\"fontSize\\\":24,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"PT Sans, sans-serif\\\",\\\"color\\\":\\\"#5C4B42\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"coffee_name\\\"},{\\\"id\\\":\\\"text3\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":50,\\\"y\\\":200,\\\"width\\\":250,\\\"height\\\":80,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"Tasting Notes:\\\\n{{tasting_notes}}\\\",\\\"fontSize\\\":16,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"PT Sans, sans-serif\\\",\\\"color\\\":\\\"#5C4B42\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"tasting_notes\\\"},{\\\"id\\\":\\\"text4\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":50,\\\"y\\\":300,\\\"width\\\":250,\\\"height\\\":30,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"Origin: {{origin}}\\\",\\\"fontSize\\\":16,\\\"fontWeight\\\":\\\"bold\\\",\\\"fontFamily\\\":\\\"PT Sans, sans-serif\\\",\\\"color\\\":\\\"#3A2419\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"origin\\\"},{\\\"id\\\":\\\"text5\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":125,\\\"y\\\":450,\\\"width\\\":100,\\\"height\\\":20,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{weight}}g\\\",\\\"fontSize\\\":14,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"PT Sans, sans-serif\\\",\\\"color\\\":\\\"#3A2419\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"weight\\\"}]}",
        "bulkDataJson": "string",
        "previewImageUrl": null,
        "createdAt": "2025-09-26T17:25:32.957",
        "updatedAt": "2025-09-26T17:30:24.603"
    },
    {
        "id": 3,
        "userId": "2f77522d-48bf-458b-d8e9-08dd34668e41",
        "name": "Beer Can Label",
        "description": "test2",
        "category": "test2",
        "designJson": "{\\\"settings\\\":{\\\"width\\\":400,\\\"height\\\":300,\\\"backgroundColor\\\":\\\"#F0EAD6\\\"},\\\"objects\\\":[{\\\"id\\\":\\\"image1\\\",\\\"type\\\":\\\"image\\\",\\\"x\\\":150,\\\"y\\\":20,\\\"width\\\":100,\\\"height\\\":100,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"src\\\":\\\"https://placehold.co/100x100.png?text={{logo}}\\\",\\\"key\\\":\\\"logo\\\"},{\\\"id\\\":\\\"text1\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":50,\\\"y\\\":140,\\\"width\\\":300,\\\"height\\\":50,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{beer_name}}\\\",\\\"fontSize\\\":40,\\\"fontWeight\\\":\\\"bold\\\",\\\"fontFamily\\\":\\\"Oswald, sans-serif\\\",\\\"color\\\":\\\"#2C3E50\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"beer_name\\\"},{\\\"id\\\":\\\"text2\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":50,\\\"y\\\":200,\\\"width\\\":300,\\\"height\\\":30,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{beer_style}}\\\",\\\"fontSize\\\":24,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"Montserrat, sans-serif\\\",\\\"color\\\":\\\"#E74C3C\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"beer_style\\\"},{\\\"id\\\":\\\"text3\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":150,\\\"y\\\":250,\\\"width\\\":100,\\\"height\\\":20,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"ABV: {{abv}}%\\\",\\\"fontSize\\\":14,\\\"fontWeight\\\":\\\"bold\\\",\\\"fontFamily\\\":\\\"Montserrat, sans-serif\\\",\\\"color\\\":\\\"#2C3E50\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"abv\\\"}]}",
        "bulkDataJson": null,
        "previewImageUrl": null,
        "createdAt": "2025-09-26T17:27:12.003",
        "updatedAt": null
    },
    {
        "id": 4,
        "userId": "2f77522d-48bf-458b-d8e9-08dd34668e41",
        "name": "Honey Jar Label",
        "description": "test3",
        "category": "test3",
        "designJson": "{\\\"settings\\\":{\\\"width\\\":250,\\\"height\\\":400,\\\"backgroundColor\\\":\\\"#FFFAF0\\\"},\\\"objects\\\":[{\\\"id\\\":\\\"text1\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":25,\\\"y\\\":50,\\\"width\\\":200,\\\"height\\\":60,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"{{brand_name}}\\\",\\\"fontSize\\\":32,\\\"fontWeight\\\":\\\"bold\\\",\\\"fontFamily\\\":\\\"Playfair Display, serif\\\",\\\"color\\\":\\\"#D4A017\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"brand_name\\\"},{\\\"id\\\":\\\"text2\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":25,\\\"y\\\":120,\\\"width\\\":200,\\\"height\\\":40,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"Pure {{honey_type}} Honey\\\",\\\"fontSize\\\":18,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"Merriweather, serif\\\",\\\"color\\\":\\\"#362222\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"honey_type\\\"},{\\\"id\\\":\\\"image1\\\",\\\"type\\\":\\\"image\\\",\\\"x\\\":75,\\\"y\\\":180,\\\"width\\\":100,\\\"height\\\":100,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"src\\\":\\\"https://placehold.co/100x100.png?text={{bee_icon}}\\\",\\\"key\\\":\\\"bee_icon\\\"},{\\\"id\\\":\\\"text3\\\",\\\"type\\\":\\\"text\\\",\\\"x\\\":75,\\\"y\\\":350,\\\"width\\\":100,\\\"height\\\":20,\\\"rotation\\\":0,\\\"opacity\\\":1,\\\"text\\\":\\\"Net Wt. {{weight}}oz\\\",\\\"fontSize\\\":12,\\\"fontWeight\\\":\\\"normal\\\",\\\"fontFamily\\\":\\\"Merriweather, serif\\\",\\\"color\\\":\\\"#362222\\\",\\\"textAlign\\\":\\\"center\\\",\\\"key\\\":\\\"weight\\\"}]}",
        "bulkDataJson": null,
        "previewImageUrl": null,
        "createdAt": "2025-09-26T17:28:20.917",
        "updatedAt": null
    }
];

export default function Home() {
  const [templates, setTemplates] = useState<ImagePlaceholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, tenantId } = useAuth();

  const fetchTemplates = (authCreds: { token: string | null, tenantId: string | null }) => {
      setIsLoading(true);
      setError(null);

      const processData = (data: any[]) => {
        if (!data || !Array.isArray(data)) {
           throw new Error("Received invalid data format.");
        }
        const formattedTemplates = data.map((item: any) => {
            let designJson = item.designJson;
            try {
                // The designJson is a string that needs to be parsed.
                // It might be double-escaped, so we parse it to get the real JSON string.
                designJson = JSON.parse(designJson);
            } catch (e) {
                // If it's not a parsable string, we keep it as is.
                // It might already be a valid JSON string from the dummy data.
            }
            return {
              id: `template-${item.id}`,
              description: item.name,
              imageUrl: item.previewImageUrl || `https://picsum.photos/seed/${item.id}/300/420`,
              imageHint: item.name,
              designJson: designJson, // Pass the parsed (or original) designJson
          }
        });
        setTemplates(formattedTemplates);
        setPlaceHolderImages(formattedTemplates);
      };

      if (USE_DUMMY_TEMPLATES) {
        try {
            // In dummy data, designJson is a string with escaped quotes.
            // We need to un-escape it. A simple parse should do the trick.
            const processedDummyData = dummyTemplates.map(t => {
                try {
                    return { ...t, designJson: JSON.parse(t.designJson) };
                } catch {
                    return t; // If parsing fails, use as is
                }
            });
            processData(processedDummyData);
        } catch(err) {
            console.error("Failed to process dummy templates:", err);
            setError((err as Error).message || "Failed to load dummy templates.");
        } finally {
            setIsLoading(false);
        }
        return;
      }
      
      fetchWithAuth('LabelTemplate', authCreds)
      .then(response => {
        if (!response.ok) {
           if (response.status === 401 && USE_AUTH) {
             throw new Error("Authentication failed. Please log in and try again.");
           }
          throw new Error(`API error. Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        processData(data);
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
    // This effect runs when auth is enabled and we get the credentials OR when using dummy data
    if ((USE_AUTH && token && tenantId) || USE_DUMMY_TEMPLATES) {
      fetchTemplates({ token, tenantId });
    }
  }, [token, tenantId]);

  useEffect(() => {
    // This effect runs once on mount if auth is disabled and we are not using dummy data
    if (!USE_AUTH && !USE_DUMMY_TEMPLATES) {
        fetchTemplates({ token: null, tenantId: 'c6142cc8-48bf-458b-d8e9-08dd34668e41' }); // A tenant ID might still be needed
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
