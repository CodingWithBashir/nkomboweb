import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('school_db');
    const hero = database.collection('hero');
    
    const heroData = await hero.findOne({ isActive: true });
    
    return NextResponse.json(heroData || {
      title: 'Excellence in Education',
      subtitle: 'Shaping tomorrow\'s leaders through innovative education',
      badge: 'Admissions Open 2026-2027',
      ctaText: 'Apply Now',
      ctaLink: '/admissions'
    });
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}