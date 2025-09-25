
'use client';

import { useState, useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { UseTemplateDialog } from '@/components/use-template-dialog';


export default function Home() {
  const allTemplates = PlaceHolderImages.filter(img => img.id.startsWith('template'));
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [useTemplate, setUseTemplate] = useState<ImagePlaceholder | null>(null);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template =>
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTemplates, searchQuery]);

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
        <section id="templates" className="w-full py-8">
            <div className="container px-4 md:px-6">
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
                <div className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                {filteredTemplates.length === 0 && (
                    <div className="mt-12 text-center text-muted-foreground">
                        No templates found for &quot;{searchQuery}&quot;.
                    </div>
                )}
            </div>
        </section>
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
