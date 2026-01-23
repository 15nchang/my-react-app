const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  apiVersion: '8.0'
});

const INDEX_NAME = 'items';

async function initIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    
    if (!exists) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              title: { type: 'text' },
              description: { type: 'text' },
              created_at: { type: 'date' },
              file_location: { type: 'keyword' },
              processing: { type: 'boolean' },
              status: { type: 'keyword' },
              category: { type: 'keyword' }
            }
          }
        }
      });
      console.log(`✓ Elasticsearch index "${INDEX_NAME}" created`);
    } else {
      console.log(`✓ Elasticsearch index "${INDEX_NAME}" already exists`);
    }
  } catch (err) {
    console.error('✗ Elasticsearch init error:', err.message);
    throw err;
  }
}

async function indexItem(item) {
  try {
    await client.index({
      index: INDEX_NAME,
      id: String(item.id),
      document: {
        id: item.id,
        title: item.title,
        description: item.description || null,
        created_at: item.created_at,
        file_location: item.file_location || null,
        processing: item.processing || false,
        status: item.status || null,
        category: item.category || 'inbox'
      }
    });
    await client.indices.refresh({ index: INDEX_NAME });
    console.log(`✓ Indexed item ${item.id}: ${item.title}`);
  } catch (err) {
    console.error(`✗ Elasticsearch indexing error for item ${item.id}:`, err.message);
  }
}

async function updateItem(id, updates) {
  try {
    await client.update({
      index: INDEX_NAME,
      id: String(id),
      doc: updates
    });
    await client.indices.refresh({ index: INDEX_NAME });
    console.log(`✓ Updated item ${id}`);
  } catch (err) {
    console.error(`✗ Elasticsearch update error for item ${id}:`, err.message);
  }
}

async function searchItems(query, page = 0, limit = 10, category = null) {
  try {
    // Build search query
    const mustClauses = [];
    
    // Text search
    if (query && query.trim()) {
      mustClauses.push({
        bool: {
          should: [
            { match: { title: { query, fuzziness: 'AUTO', boost: 2 } } },
            { match: { description: { query, fuzziness: 'AUTO' } } }
          ],
          minimum_should_match: 1
        }
      });
    }
    
    // Category filter
    if (category && typeof category === 'string') {
      mustClauses.push({
        term: { category }
      });
    }

    const searchQuery = mustClauses.length > 0 
      ? { bool: { must: mustClauses } }
      : { match_all: {} };

    const result = await client.search({
      index: INDEX_NAME,
      from: page * limit,
      size: limit,
      query: searchQuery,
      sort: [{ created_at: { order: 'desc' } }]
    });

    console.log(`✓ Search "${query}" (category: ${category || 'all'}) found ${result.hits.total.value} results`);
    return {
      items: result.hits.hits.map(hit => hit._source),
      total: result.hits.total.value
    };
  } catch (err) {
    console.error(`✗ Elasticsearch search error for "${query}":`, err.message);
    throw err;
  }
}

module.exports = {
  client,
  initIndex,
  indexItem,
  updateItem,
  searchItems
};
