
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';

export default function Home() {
  const templates = PlaceHolderImages.filter(img => img.id.startsWith('template'));
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="flex items-center justify-between w-full">
                <Link href="/" className="flex items-center gap-2">
                    <Type className="h-6 w-6 text-primary" />
                    <span className="font-semibold font-headline">Label Designer</span>
                </Link>
                <nav className="flex items-center gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="/#templates">Templates</Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard/editor">Canvas</Link>
                </nav>
            </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
            {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover object-center"
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="container relative px-4 md:px-6 text-center text-foreground">
                <div className="bg-background/70 backdrop-blur-sm rounded-xl p-8 inline-block">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                        Design professional labels in minutes.
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                        Create beautiful, print-ready labels for your products with our intuitive editor and AI-powered tools.
                    </p>
                    <div className="mt-8">
                        <Button asChild size="lg">
                            <Link href="/dashboard/editor">Start Designing Now</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section id="templates" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Template Gallery</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Kickstart your project with one of our professionally designed templates. Click on any template to open it in the editor.
                        </p>
                    </div>
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
       <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Type className="h-6 w-6 text-primary" />
            <span className="font-semibold font-headline">Label Designer</span>
          </Link>
          <p className="text-xs text-muted-foreground">&copy; 2024 Label Designer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
