
'use server';

import { 
    getMockTemplates, 
    createMockTemplate, 
    updateMockTemplate, 
    deleteMockTemplate 
} from '@/lib/mock-api';
import type { Template } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This file contains server actions that can be called from client components.
// It acts as a layer between the UI and the API/mock API.

export async function getTemplatesAction(): Promise<Template[]> {
    return await getMockTemplates();
}

export async function createTemplateAction(
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<Template> {
    const result = await createMockTemplate(data);
    revalidatePath('/'); // Invalidate the cache for the homepage
    return result;
}

export async function updateTemplateAction(
    id: number,
    data: Partial<Template>
): Promise<Template> {
    const result = await updateMockTemplate(id, data);
    revalidatePath('/');
    return result;
}

export async function deleteTemplateAction(id: number): Promise<{ success: boolean }> {
    const result = await deleteMockTemplate(id);
    revalidatePath('/');
    return result;
}

    