
'use server';

import { 
    getMockTemplates, 
    createMockTemplate, 
    updateMockTemplate, 
    deleteMockTemplate 
} from '@/lib/mock-api';
import type { Template } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { USE_DUMMY_TEMPLATES } from '@/lib/config';
import { fetchWithAuth } from '@/lib/api';
import { headers } from 'next/headers';

// This file contains server actions that can be called from client components.
// It acts as a layer between the UI and the API/mock API.

export async function getTemplatesAction(): Promise<Template[]> {
    if (USE_DUMMY_TEMPLATES) {
        return await getMockTemplates();
    }
    
    const response = await fetchWithAuth('LabelTemplate', { token: null, tenantId: null });
    if (!response.ok) {
        throw new Error(`API error. Status: ${response.status}`);
    }
    return await response.json();
}

export async function createTemplateAction(
    formData: FormData
): Promise<Template> {
    if (USE_DUMMY_TEMPLATES) {
        const templateData = {
            name: formData.get('Name') as string,
            description: formData.get('Description') as string,
            category: formData.get('Category') as string,
            designJson: formData.get('DesignJson') as string,
            bulkDataJson: formData.get('BulkDataJson') as string,
            previewImageUrl: null // Mock API doesn't handle file uploads
        };
        return await createMockTemplate(templateData);
    }

    const response = await fetchWithAuth('LabelTemplate', { token: null, tenantId: null }, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to create template. Status: ${response.status}`);
    }

    const result = await response.json();
    revalidatePath('/'); // Invalidate the cache for the homepage
    return result;
}

export async function updateTemplateAction(
    id: number,
    formData: FormData
): Promise<Template> {
    if (USE_DUMMY_TEMPLATES) {
         const templateData = {
            name: formData.get('Name') as string,
            description: formData.get('Description') as string,
            category: formData.get('Category') as string,
            designJson: formData.get('DesignJson') as string,
            bulkDataJson: formData.get('BulkDataJson') as string,
        };
        return await updateMockTemplate(id, templateData);
    }

    const response = await fetchWithAuth(`LabelTemplate/${id}`, { token: null, tenantId: null }, {
        method: 'PUT',
        body: formData,
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to update template. Status: ${response.status}`);
    }
    const result = await response.json();
    revalidatePath('/');
    return result;
}

export async function deleteTemplateAction(id: number): Promise<{ success: boolean }> {
    if (USE_DUMMY_TEMPLATES) {
        const result = await deleteMockTemplate(id);
        revalidatePath('/');
        return result;
    }

    const response = await fetchWithAuth(`LabelTemplate/${id}`, { token: null, tenantId: null }, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete template. Status: ${response.status}`);
    }
    revalidatePath('/');
    return { success: true };
}
