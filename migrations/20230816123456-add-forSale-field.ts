import { MongoClient, UpdateResult } from 'mongodb';

const url =
  'mongodb+srv://serbynvitalii:grbUkwkhH0gYudEZ@moxy.ez6ytuk.mongodb.net/';

const migrate = async () => {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db();
    const productsCollection = db.collection('products');

    // Update each document to add the forSale field with a default value of true
    const updateResult: UpdateResult = await productsCollection.updateMany(
      { forSale: { $exists: false } }, // Update documents where forSale field doesn't exist
      { $set: { forSale: true } },
    );

    console.log(
      `Migration completed successfully. Modified ${updateResult.modifiedCount} documents.`,
    );
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.close();
  }
};

migrate();
