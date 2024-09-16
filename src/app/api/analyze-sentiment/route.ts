import { NextRequest, NextResponse } from 'next/server';
import natural from 'natural';

const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");

interface RequestBody {
  text: string;
}

interface SentimentResponse {
  positive: number;
  negative: number;
  neutral: number;
  overall: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<SentimentResponse>> {
  const { text }: RequestBody = await req.json();
  
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;
  const tokens = tokenizer.tokenize(text);
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  const sentiment = analyzer.getSentiment(stemmedTokens);
  
  const total = Math.abs(sentiment);
  const positive = Math.max(0, sentiment) / total * 100;
  const negative = Math.max(0, -sentiment) / total * 100;
  const neutral = 100 - positive - negative;
  
  let overall: string;
  if (sentiment > 0.05) {
    overall = "Positive";
  } else if (sentiment < -0.05) {
    overall = "Negative";
  } else {
    overall = "Neutral";
  }
  
  return NextResponse.json({
    positive,
    negative,
    neutral,
    overall
  });
}