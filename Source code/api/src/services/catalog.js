import { v4 as uuidv4 } from 'uuid';
import pool from './db.js';

// safely serialize - if already a string, store as-is wrapped in JSON string
const serialize = (val) => {
  if (val == null) return null;
  if (typeof val === 'string') return JSON.stringify(val); // wrap plain strings
  return JSON.stringify(val);
};
const nullify = (val) => val ?? null;
// safely parse - handles already-parsed objects, plain strings, and JSON strings
const parse = (val) => {
  if (val == null) return null;
  if (typeof val !== 'string') return val; // already parsed by MySQL driver
  try { return JSON.parse(val); } catch { return val; } // fallback to raw string
};
const row2entry = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    category: parse(row.category),
    attributes: parse(row.attributes),
    tags: parse(row.tags) || [],
    specifications: parse(row.specifications),
    targetAudience: row.target_audience,
    suggestedKeywords: parse(row.suggested_keywords) || [],
    pricePositioning: row.price_positioning,
    confidence: row.confidence,
    dataSource: parse(row.data_source),
    sourceType: row.source_type,
    originalFilename: row.original_filename,
    originalDescription: row.original_description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

class CatalogService {
  async create(data) {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO catalog_entries
        (id, title, short_description, full_description, category, attributes, tags,
         specifications, target_audience, suggested_keywords, price_positioning,
         confidence, data_source, source_type, original_filename, original_description)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, nullify(data.title), nullify(data.shortDescription), nullify(data.fullDescription),
        serialize(data.category), serialize(data.attributes), serialize(data.tags || []),
        serialize(data.specifications), nullify(data.targetAudience),
        serialize(data.suggestedKeywords || []), nullify(data.pricePositioning),
        nullify(data.confidence), serialize(data.dataSource), nullify(data.sourceType),
        nullify(data.originalFilename), nullify(data.originalDescription)
      ]
    );
    return this.getById(id);
  }

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM catalog_entries WHERE id = ?', [id]);
    return row2entry(rows[0]);
  }

  async getAll(filters = {}) {
    let query = 'SELECT * FROM catalog_entries WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND title LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows.map(row2entry);
  }

  async update(id, updates) {
    const fields = [];
    const params = [];

    const fieldMap = {
      title: 'title', shortDescription: 'short_description',
      fullDescription: 'full_description', status: 'status',
      targetAudience: 'target_audience', pricePositioning: 'price_positioning',
      confidence: 'confidence'
    };
    const jsonFields = ['category', 'attributes', 'tags', 'specifications', 'suggestedKeywords', 'dataSource'];

    Object.entries(updates).forEach(([key, val]) => {
      if (fieldMap[key]) {
        fields.push(`${fieldMap[key]} = ?`);
        params.push(val);
      } else if (jsonFields.includes(key)) {
        const col = key === 'suggestedKeywords' ? 'suggested_keywords' : key === 'dataSource' ? 'data_source' : key;
        fields.push(`${col} = ?`);
        params.push(serialize(val));
      }
    });

    if (!fields.length) return this.getById(id);
    params.push(id);
    await pool.execute(`UPDATE catalog_entries SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.getById(id);
  }

  async delete(id) {
    await pool.execute('DELETE FROM catalog_entries WHERE id = ?', [id]);
  }

  async publish(id) {
    return this.update(id, { status: 'published' });
  }

  async getStats() {
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM catalog_entries');
    const [[{ published }]] = await pool.execute("SELECT COUNT(*) as published FROM catalog_entries WHERE status = 'published'");
    const [[{ draft }]] = await pool.execute("SELECT COUNT(*) as draft FROM catalog_entries WHERE status = 'draft'");
    const [rows] = await pool.execute('SELECT category FROM catalog_entries');

    const byCategory = {};
    rows.forEach(r => {
      const cat = parse(r.category)?.primary || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return { total, published, draft, byCategory };
  }
}

export default new CatalogService();
