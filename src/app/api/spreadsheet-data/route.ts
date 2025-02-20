import { google } from 'googleapis';
import { NextResponse } from 'next/server';

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return auth;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Spreadsheet ID is required' }, { status: 400 });
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: 'A1:Z1000', // Adjust range as needed
    });

    const values = response.data.values || [];
    if (values.length < 2) {
      return NextResponse.json({ error: 'Not enough data in spreadsheet' }, { status: 400 });
    }

    // Convert the data to the expected format
    const headers = values[0];
    const data = values.slice(1).map(row => {
      const rowData: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        rowData[header] = row[index] || '';
      });
      return rowData;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch spreadsheet data' }, { status: 500 });
  }
} 