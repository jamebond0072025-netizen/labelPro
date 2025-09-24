import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  const templates = PlaceHolderImages.filter(img => img.id.startsWith('template'));

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Template Gallery</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Kickstart your project with one of our professionally designed templates. Click on any template to open it in the editor.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map(template => (
          <Link href={`/dashboard/editor?template=${template.id}`} key={template.id}>
            <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative aspect-[5/7] w-full">
                  <Image
                    src={template.imageUrl}
                    alt={template.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={template.imageHint}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm truncate">{template.description}</h3>
                  <Button variant="link" className="p-0 h-auto mt-1">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
