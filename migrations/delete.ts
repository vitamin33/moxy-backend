import { MongoClient, DeleteResult } from 'mongodb';

const url =
  'mongodb+srv://serbynvitalii:grbUkwkhH0gYudEZ@moxy.ez6ytuk.mongodb.net/';

const migrate = async () => {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find the first 20 users
    const first20Users = await usersCollection.find().limit(20).toArray();

    // Get the IDs of the first 20 users
    const first20UserIds = first20Users.map((user) => user._id);

    // Delete all users except the first 20
    const deleteResult: DeleteResult = await usersCollection.deleteMany({
      _id: { $nin: first20UserIds },
    });

    console.log(
      `Migration completed successfully. Deleted ${deleteResult.deletedCount} users.`,
    );
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.close();
  }
};

migrate();
