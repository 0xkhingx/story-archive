import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const stories = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/stories" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(["films", "animation", "life"]),
    source: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    cover: z.string(),
    coverAlt: z.string().default(""),
  }),
});

export const collections = { stories };
