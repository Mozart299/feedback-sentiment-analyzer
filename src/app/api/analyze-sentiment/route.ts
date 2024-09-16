import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface RequestBody {
  text: string;
}


interface SentimentResponse {
  positive: number;
  negative: number;
  overall: string;
}

const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';
const HUGGING_FACE_API_KEY = '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'; // Add this to your environment variables

export async function POST(req: NextRequest): Promise<NextResponse<SentimentResponse>> {
  const { text }: RequestBody = await req.json();

  try {
    const response = await axios.post(
      HUGGING_FACE_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        },
      }
    );

    // Log the raw response from the model
    console.log('Raw response from Hugging Face API:', response.data);

    const result = response.data[0];

    // Extract scores directly from the result
    const positiveScore = result.find((item: { label: string; score: number }) => item.label === 'POSITIVE')?.score || 0;
    const negativeScore = result.find((item: { label: string; score: number }) => item.label === 'NEGATIVE')?.score || 0;

    // Calculate percentages
    const positive = positiveScore * 100; // Convert to percentage
    const negative = negativeScore * 100; // Convert to percentage

    // Determine overall sentiment based on scores
    const overall = positive > negative ? 'Positive' : 'Negative';

    return NextResponse.json({
      positive,
      negative,
      overall,
    });
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);

    // Return a default sentiment response in case of error
    return NextResponse.json({
      positive: 0,
      negative: 0,
      overall: 'Negative' // Defaulting to Negative in case of error for better clarity
    });
  }
}