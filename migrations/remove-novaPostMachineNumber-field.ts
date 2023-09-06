import { MongoClient, UpdateResult } from 'mongodb';

const url = 'mongodb+srv://serbynvitalii:<password>@moxy.ez6ytuk.mongodb.net/';

const migrate = async () => {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection('users');

    // Remove the novaPostMachineNumber field from all documents
    const updateResult: UpdateResult = await usersCollection.updateMany(
      {},
      { $unset: { novaPostMachineNumber: 1 } },
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
