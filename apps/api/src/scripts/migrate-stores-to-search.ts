import { Search } from '@upstash/search';
import 'dotenv/config';
import { Client } from 'pg';

async function migrateStoresToSearch() {
  // Initialize Upstash Search client
  const searchClient = new Search({
    url: process.env.UPSTASH_SEARCH_REST_URL,
    token: process.env.UPSTASH_SEARCH_REST_TOKEN,
  });

  try {
    await searchClient.index('stores').deleteIndex();
    console.log('Store index deleted');
  } catch (error) {
    console.log('Store index did not exist yet, continuing...');
  }

  // Initialize database connection using pg client directly
  const pgClient = new Client(process.env.DB_URL);

  await pgClient.connect();

  try {
    console.log('Starting migration of stores to Upstash Search...');

    // Get all active stores with related gallery, services, and reviews using raw query
    const result = await pgClient.query(
      `
      SELECT
        s.id,
        s.name,
        s.description,
        s.address,
        s."openTime",
        s."closeTime",
        s."businessDays",
        s.city,
        s.state,
        s."zipCode",
        s."ownerId",
        s.telephone,
        s.email,
        s.website,
        s.instagram,
        s.facebook,
        s.amenities,
        json_agg(DISTINCT jsonb_build_object('id', g.id, 'url', g.url)) FILTER (WHERE g.id IS NOT NULL) as gallery,
        json_agg(DISTINCT jsonb_build_object('id', sv.id, 'name', sv.name, 'description', sv.description, 'price', sv.price)) FILTER (WHERE sv.id IS NOT NULL) as services,
        json_agg(DISTINCT jsonb_build_object('id', r.id, 'rating', r.rating, 'comment', r.comment)) FILTER (WHERE r.id IS NOT NULL) as reviews
      FROM stores s
      LEFT JOIN gallery g ON s.id = g."storeId"
      LEFT JOIN services sv ON s.id = sv."storeId"
      LEFT JOIN reviews r ON s.id = r."storeId"
      GROUP BY s.id, s.name, s.description, s.address, s."openTime", s."closeTime", s."businessDays", s.city, s.state, s."zipCode", s."ownerId", s.telephone, s.email, s.website, s.instagram, s.facebook, s.amenities
      `,
    );

    const stores = result.rows;
    console.log(`Found ${stores.length} stores to index`);

    if (stores.length === 0) {
      console.log('No stores to migrate');
      return;
    }

    // Prepare documents for indexing
    const documents = stores.map((store: any) => {
      const services = store.services || [];
      const serviceNames = services
        .map((service: { name?: string }) => service?.name)
        .filter(Boolean);
      const searchText = [
        store.name,
        store.description,
        store.city,
        store.state,
        store.address,
        ...serviceNames,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: store.id,
        content: {
          name: store.name,
          description: store.description,
          address: store.address,
          city: store.city,
          state: store.state,
          zipCode: store.zipCode,
          services,
          serviceNames,
          categoryNames: [],
          searchText,
          openTime: store.openTime,
          closeTime: store.closeTime,
          businessDays: store.businessDays,
        },
        metadata: {
          ownerId: store.ownerId,
          createdAt: store.createdAt,
          telephone: store.telephone,
          email: store.email,
          website: store.website,
          instagram: store.instagram,
          facebook: store.facebook,
          amenities: store.amenities,
          gallery: store.gallery || [],
          reviews: store.reviews || [],
        },
      };
    });

    // Upsert documents in batches (Upstash Search may have batch size limits)
    const batchSize = 100;
    let processed = 0;

    const index = await searchClient.index('stores');
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      await index.upsert(batch);

      processed += batch.length;
      console.log(`Indexed ${processed}/${documents.length} stores`);
    }

    const info = await searchClient.info();
    console.log('Migration completed successfully!');
    console.log('Index info:', {
      documentCount: info.documentCount,
      diskSize: info.diskSize,
      pendingDocumentCount: info.pendingDocumentCount,
    });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pgClient.end();
  }
}

// Run migration
migrateStoresToSearch().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
