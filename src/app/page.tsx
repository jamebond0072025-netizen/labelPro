
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const templates = PlaceHolderImages.filter(img => img.id.startsWith('template'));

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1">
        <section id="templates" className="w-full py-12 md:py-16 lg:py-20">
            <div className="container px-4 md:px-6">
                 <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Templates</h1>
                        <p className="text-muted-foreground md:text-lg/relaxed">
                            Kickstart your project with one of our professionally designed templates.
                        </p>
                    </div>
                    <Button asChild size="lg">
                        <Link href="/dashboard/editor"><Plus className="mr-2 h-5 w-5" /> Create New Design</Link>
                    </Button>
                </div>
                <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                     {templates.map(template => (
                        <Link href={`/dashboard/editor?template=${template.id}`} key={template.id}>
                        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full">
                            <CardContent className="p-0 flex flex-col">
                            <div className="relative aspect-[10/14] w-full">
                                <Image
                                src={template.imageUrl}
                                alt={template.description}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={template.imageHint}
                                />
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-sm truncate">{template.description}</h3>
                            </div>
                            </CardContent>
                        </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
