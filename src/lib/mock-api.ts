
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Template } from '@/lib/types';

const filePath = path.join(process.cwd(), 'src', 'lib', 'dummy-templates.json');

async function readTemplates(): Promise<Template[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    console.error("Error reading dummy templates:", error);
    throw new Error("Could not read dummy templates.");
  }
}

async function writeTemplates(templates: Template[]): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(templates, null, 4), 'utf-8');
  } catch (error) {
    console.error("Error writing dummy templates:", error);
    throw new Error("Could not write dummy templates.");
  }
}

export async function getMockTemplates(): Promise<Template[]> {
  return await readTemplates();
}

export async function createMockTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Template> {
  const templates = await readTemplates();
  const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
  
  const newTemplate: Template = {
    ...templateData,
    id: newId,
    userId: 'mock-user-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  templates.push(newTemplate);
  await writeTemplates(templates);
  return newTemplate;
}

export async function updateMockTemplate(id: number, templateData: Partial<Template>): Promise<Template> {
  const templates = await readTemplates();
  const index = templates.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error("Template not found.");
  }

  const updatedTemplate = {
    ...templates[index],
    ...templateData,
    id, // ensure id is not changed
    updatedAt: new Date().toISOString(),
  };

  templates[index] = updatedTemplate;
  await writeTemplates(templates);
  return updatedTemplate;
}

export async function deleteMockTemplate(id: number): Promise<{ success: boolean }> {
  let templates = await readTemplates();
  const initialLength = templates.length;
  templates = templates.filter(t => t.id !== id);

  if (templates.length === initialLength) {
    throw new Error("Template not found.");
  }

  await writeTemplates(templates);
  return { success: true };
}

    