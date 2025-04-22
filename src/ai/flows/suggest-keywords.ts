// src/ai/flows/suggest-keywords.ts
'use server';
/**
 * @fileOverview Suggests relevant keywords for a blog post based on its content.
 *
 * - suggestKeywords - A function that suggests keywords for SEO optimization.
 * - SuggestKeywordsInput - The input type for the suggestKeywords function.
 * - SuggestKeywordsOutput - The return type for the suggestKeywords function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestKeywordsInputSchema = z.object({
  blogContent: z
    .string()
    .describe('The content of the blog post to generate keywords for.'),
});

export type SuggestKeywordsInput = z.infer<typeof SuggestKeywordsInputSchema>;

const SuggestKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of relevant keywords for the blog post.'),
});

export type SuggestKeywordsOutput = z.infer<typeof SuggestKeywordsOutputSchema>;

export async function suggestKeywords(input: SuggestKeywordsInput): Promise<SuggestKeywordsOutput> {
  return suggestKeywordsFlow(input);
}

const suggestKeywordsPrompt = ai.definePrompt({
  name: 'suggestKeywordsPrompt',
  input: {
    schema: z.object({
      blogContent: z
        .string()
        .describe('The content of the blog post to generate keywords for.'),
    }),
  },
  output: {
    schema: z.object({
      keywords: z
        .array(z.string())
        .describe('An array of relevant keywords for the blog post.'),
    }),
  },
  prompt: `You are an SEO expert. Generate a list of keywords for the following blog post content:

    {{blogContent}}

    Return the keywords as a JSON array of strings.
    `,
});

const suggestKeywordsFlow = ai.defineFlow<
  typeof SuggestKeywordsInputSchema,
  typeof SuggestKeywordsOutputSchema
>(
  {
    name: 'suggestKeywordsFlow',
    inputSchema: SuggestKeywordsInputSchema,
    outputSchema: SuggestKeywordsOutputSchema,
  },
  async input => {
    const {output} = await suggestKeywordsPrompt(input);
    return output!;
  }
);
