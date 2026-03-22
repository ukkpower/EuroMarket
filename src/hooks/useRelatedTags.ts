'use client';

import { useQuery } from '@tanstack/react-query';
import type { Category, SubFilter } from '@/types/market';
import type { PolymarketTag } from '@/types/market';
import {
  DYNAMIC_CATEGORY_TO_SLUG,
  isDynamicCategory,
} from '@/data/categories';

function mapTagToSubFilter(tag: PolymarketTag, category: Category): SubFilter {
  return {
    id: tag.slug,
    label: tag.label,
    category,
    tagId: tag.id,
  };
}

async function fetchRelatedTags(
  slug: string,
  category: Category
): Promise<SubFilter[]> {
  const res = await fetch(
    `/api/polymarket/tags/related/${encodeURIComponent(slug)}`
  );
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('Failed to fetch related tags');
  }
  const tags: PolymarketTag[] = await res.json();
  return tags.map((tag) => mapTagToSubFilter(tag, category));
}

export function useRelatedTags(
  category: Category,
  options?: { enabled?: boolean }
) {
  const isDynamic = isDynamicCategory(category);
  const slug = isDynamic ? DYNAMIC_CATEGORY_TO_SLUG[category] : undefined;
  const enabled = (options?.enabled ?? true) && !!slug;

  const query = useQuery<SubFilter[]>({
    queryKey: ['related-tags', category],
    queryFn: () => fetchRelatedTags(slug!, category),
    enabled,
  });

  if (!isDynamic) {
    return { subFilters: [], isLoading: false, isError: false, error: null };
  }

  return {
    subFilters: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
