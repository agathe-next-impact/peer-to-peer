// Types génériques API Strapi

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiMeta {
  pagination: StrapiPagination;
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details: Record<string, unknown>;
}

export interface StrapiEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  name: string;
}

export interface StrapiMedia extends StrapiEntity {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
    xlarge?: StrapiMediaFormat;
  };
  url: string;
  mime: string;
  size: number;
}
