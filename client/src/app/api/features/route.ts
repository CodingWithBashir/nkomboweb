import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('school_db');
    const features = database.collection('features');
    
    const featuresData = await features.find({ isActive: true }).toArray();
    
    return NextResponse.json({ features: featuresData });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { features: [] },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}