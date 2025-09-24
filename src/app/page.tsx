import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, DraftingCompass, Droplets, Wand2, Type } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <DraftingCompass className="w-8 h-8 text-primary" />,
    title: 'Intuitive Drag & Drop',
    description: 'Easily build your labels with our user-friendly drag and drop canvas.',
  },
  {
    icon: <Droplets className="w-8 h-8 text-primary" />,
    title: 'Template Gallery',
    description: 'Start with a wide variety of professional, pre-designed label templates.',
  },
  {
    icon: <Wand2 className="w-8 h-8 text-primary" />,
    title: 'AI Recommendations',
    description: 'Get intelligent design suggestions based on your keywords and industry.',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-primary" />,
    title: 'Multiple Export Options',
    description: 'Export your final designs in PNG, SVG, or PDF for printing or digital use.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
            <Type className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-gray-800">LabelPro</h1>
        </div>
        <nav>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
              Create Professional Labels in Minutes
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              The ultimate tool for designing, customizing, and exporting high-quality labels for your business or personal projects.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">Start Designing Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/templates">Browse Templates</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Powerful Features, Simple Interface</h2>
              <p className="mt-3 text-lg text-muted-foreground">Everything you need to bring your label designs to life.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="font-headline text-xl mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Ready to create stunning labels?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Jump into our editor and experience the power of LabelPro today.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/dashboard">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LabelPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
