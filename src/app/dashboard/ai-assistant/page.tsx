'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getAIDesignRecommendations } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Recommendations
    </Button>
  );
}

export default function AiAssistantPage() {
  const [state, formAction] = useFormState(getAIDesignRecommendations, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      })
    }
  }, [state, toast]);


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">AI Design Assistant</CardTitle>
          <CardDescription>
            Describe your product or provide some keywords, and our AI will suggest design elements for your label.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="keywords">Keywords or Description</Label>
              <Textarea
                id="keywords"
                name="keywords"
                placeholder="e.g., 'Organic honey, rustic, minimalist' or 'A bold label for a craft hot sauce'"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {state?.recommendations && (
         <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-2xl">Recommendations</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {state.recommendations}
                </div>
            </CardContent>
         </Card>
      )}

    </div>
  );
}
