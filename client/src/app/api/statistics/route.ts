import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('school_db');
    const statistics = database.collection('statistics');
    
    const statsData = await statistics.find({}).toArray();
    
    return NextResponse.json({ statistics: statsData });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { statistics: [] },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}