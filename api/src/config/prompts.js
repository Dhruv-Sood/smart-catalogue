// Engineered prompts for product cataloging

export const SYSTEM_CONTEXT = `You are an expert e-commerce product cataloging AI assistant. Your role is to analyze product images and descriptions to generate structured, SEO-optimized catalog entries.

You have deep expertise in:
- Product categorization across retail verticals (fashion, electronics, home goods, etc.)
- SEO-friendly title and description writing
- Attribute extraction and standardization
- Tag generation for searchability
- Price positioning insights based on product features

Always respond with valid JSON. Be precise, consistent, and focus on attributes that matter for e-commerce search and filtering.`;

export const IMAGE_ANALYSIS_PROMPT = `Analyze this product image and extract detailed catalog information.

Return a JSON object with this exact structure:
{
  "title": "SEO-optimized product title (50-80 chars)",
  "shortDescription": "Compelling 1-2 sentence description for listings",
  "fullDescription": "Detailed 3-5 sentence description highlighting features and benefits",
  "category": {
    "primary": "Main category (e.g., 'Clothing', 'Electronics')",
    "secondary": "Subcategory (e.g., 'T-Shirts', 'Smartphones')",
    "tertiary": "Specific type if applicable (e.g., 'Graphic Tees')"
  },
  "attributes": {
    "color": "Primary color(s)",
    "material": "Material composition if visible",
    "style": "Style descriptors",
    "size": "Size if determinable or 'varies'",
    "condition": "new/used/refurbished"
  },
  "tags": ["array", "of", "searchable", "tags", "minimum", "8", "tags"],
  "targetAudience": "Who this product is for",
  "suggestedKeywords": ["seo", "keywords", "for", "search"],
  "confidence": 0.0-1.0
}

Focus on accuracy. If something isn't visible or determinable, use null or reasonable defaults.`;

export const TEXT_ANALYSIS_PROMPT = `Analyze this raw product description and transform it into a structured catalog entry.

Raw description:
{description}

Return a JSON object with this exact structure:
{
  "title": "SEO-optimized product title (50-80 chars)",
  "shortDescription": "Compelling 1-2 sentence description for listings",
  "fullDescription": "Detailed 3-5 sentence description highlighting features and benefits",
  "category": {
    "primary": "Main category",
    "secondary": "Subcategory",
    "tertiary": "Specific type if applicable"
  },
  "attributes": {
    "extracted": "key-value pairs of all product attributes found"
  },
  "tags": ["array", "of", "searchable", "tags", "minimum", "8"],
  "specifications": "Any technical specs mentioned",
  "suggestedKeywords": ["seo", "keywords"],
  "confidence": 0.0-1.0
}

Extract ALL useful information. Standardize inconsistent formatting. Generate tags that customers would search for.`;

export const COMBINED_ANALYSIS_PROMPT = `Analyze both the product image and description to create a comprehensive catalog entry.

Product description provided:
{description}

Combine visual analysis with the text description. Resolve any conflicts by prioritizing visual evidence for physical attributes and text for specifications/features.

Return a JSON object with this exact structure:
{
  "title": "SEO-optimized product title (50-80 chars)",
  "shortDescription": "Compelling 1-2 sentence description",
  "fullDescription": "Detailed 3-5 sentence description",
  "category": {
    "primary": "Main category",
    "secondary": "Subcategory", 
    "tertiary": "Specific type"
  },
  "attributes": {
    "color": "From image",
    "material": "From text or image",
    "dimensions": "If available",
    "weight": "If available",
    "style": "Style descriptors",
    "condition": "new/used/refurbished"
  },
  "tags": ["comprehensive", "tag", "list", "minimum", "10"],
  "specifications": {},
  "targetAudience": "Who this product is for",
  "suggestedKeywords": ["seo", "keywords"],
  "pricePositioning": "budget/mid-range/premium based on features",
  "confidence": 0.0-1.0,
  "dataSource": {
    "fromImage": ["attributes derived from image"],
    "fromText": ["attributes derived from description"]
  }
}`;

export const BATCH_CATEGORIZATION_PROMPT = `You are categorizing multiple products for bulk import. For each product, assign consistent categories and tags.

Products to categorize:
{products}

Return a JSON array where each item has:
{
  "index": original_index,
  "category": { "primary": "", "secondary": "", "tertiary": "" },
  "tags": ["consistent", "tags"],
  "confidence": 0.0-1.0
}

Ensure category consistency - similar products should have identical category paths.`;
