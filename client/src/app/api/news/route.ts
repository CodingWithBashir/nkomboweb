import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const category = searchParams.get('category');
    
    await client.connect();
    const database = client.db('school_db');
    const news = database.collection('news');
    
    const query: any = { isPublished: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const total = await news.countDocuments(query);
    const newsData = await news.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({
      news: newsData,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { news: [], error: 'Failed to fetch news' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}