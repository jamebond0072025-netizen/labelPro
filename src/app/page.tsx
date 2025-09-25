
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const templates = PlaceHolderImages.filter(img => img.id.startsWith('template'));

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <main className="flex-1">
        <section id="templates" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-8 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Label Designer</h1>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Create a new design from scratch or kickstart your project with one of our professionally designed templates.
                        </p>
                    </div>
                    <Button asChild size="lg">
                        <Link href="/dashboard/editor">Create New Design</Link>
                    </Button>
                </div>
                <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
                     {templates.map(template => (
                        <Link href={`/dashboard/editor?template=${template.id}`} key={template.id}>
                        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full">
                            <CardContent className="p-0 flex flex-col">
                            <div className="relative aspect-[5/7] w-full">
                                <Image
                                src={template.imageUrl}
                                alt={template.description}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={template.imageHint}
                                />
                            </div>
                            <div className="p-4 flex-grow flex flex-col">
                                <h3 className="font-semibold text-sm truncate flex-grow">{template.description}</h3>
                                <Button variant="link" className="p-0 h-auto mt-2 self-start">Use Template</Button>
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
