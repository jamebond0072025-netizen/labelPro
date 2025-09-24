'use server';

import { generateLabelRecommendations } from '@/ai/flows/generate-label-recommendations';
import { z } from 'zod';

const schema = z.object({
  keywords: z.string().min(3, 'Please enter at least 3 characters.'),
});

interface FormState {
  message: string;
  recommendations?: string;
}

export async function getAIDesignRecommendations(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    keywords: formData.get('keywords'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. ' + validatedFields.error.flatten().fieldErrors.keywords?.join(', '),
    };
  }

  try {
    const result = await generateLabelRecommendations({
      keywords: validatedFields.data.keywords,
    });
    
    if (result.recommendations) {
        return { message: 'success', recommendations: result.recommendations };
    } else {
        return { message: 'Could not generate recommendations.' };
    }

  } catch (error) {
    console.error(error);
    return { message: 'An unexpected error occurred.' };
  }
}
