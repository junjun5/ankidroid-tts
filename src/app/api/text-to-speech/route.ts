import { NextResponse } from 'next/server';

// Google Cloud Text-to-Speech APIのURL
const API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'テキストが提供されていません。' }, { status: 400 });
    }

    // Google Cloud Text-to-Speech APIへのリクエストボディ
    const requestBody = {
      input: {
        text: text,
      },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Chirp3-HD-Umbriel', // 日本語のボイスモデルを指定
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('APIエラー:', errorData);
      return NextResponse.json({ error: '音声変換APIの呼び出しに失敗しました。' }, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    const audioContent = data.audioContent; // Base64エンコードされた音声データ

    // Base64をデコードして、バイナリデータとして返す
    const audioBuffer = Buffer.from(audioContent, 'base64');

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
      },
    });

  } catch (error) {
    console.error('サーバーエラー:', error);
    return NextResponse.json({ error: 'サーバー内部エラー' }, { status: 500 });
  }
}
