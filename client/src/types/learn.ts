export type GlossaryCategory = 'indicator' | 'risk' | 'strategy' | 'market' | 'psychology' | 'metric';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type GlossaryTerm = {
  id: string;
  term: string;
  fullName: string;
  category: GlossaryCategory;
  difficulty: Difficulty;
  definition: string;
  howToUse: string;
  example: string;
  related: string[];
  tags: string[];
  icon: string;
};

export type WikiResult = {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
};

export type UseLearnSearchReturn = {
  query: string;
  setQuery: (q: string) => void;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  results: GlossaryTerm[];
  suggestions: string[];
  isWikiLoading: boolean;
  wikiResult: WikiResult | null;
  wikiError: string | null;
  selectedTerm: GlossaryTerm | null;
  setSelectedTerm: (t: GlossaryTerm | null) => void;
  totalCount: number;
  filteredCount: number;
};
