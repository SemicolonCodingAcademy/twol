import { google } from 'googleapis';
import { NextResponse } from 'next/server';

async function getAuthClient() {
  try {
    // Remove any extra quotes from the environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.replace(/^["']|["']$/g, '');
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');

    console.log('Auth Debug Info:');
    console.log('Client Email present:', !!clientEmail);
    console.log('Private Key present:', !!privateKey);
    if (privateKey) {
      console.log('Private Key starts with:', privateKey.substring(0, 27));
      console.log('Private Key ends with:', privateKey.substring(privateKey.length - 25));
    }

    if (!clientEmail || !privateKey) {
      throw new Error('Missing required credentials');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return auth;
  } catch (error) {
    console.error('Auth Error:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Request Debug Info:');
    console.log('Spreadsheet ID:', id);

    if (!id) {
      return NextResponse.json({ error: 'Spreadsheet ID is required' }, { status: 400 });
    }

    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Fetching spreadsheet data...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: 'A1:Z1000', // Adjust range as needed
    });

    const values = response.data.values || [];
    console.log('Received data rows:', values.length);

    if (values.length < 2) {
      return NextResponse.json({ error: 'Not enough data in spreadsheet' }, { status: 400 });
    }

    // Convert the data to the expected format
    const headers = values[0];
    console.log('Headers:', headers);

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
    return NextResponse.json({ 
      error: 'Failed to fetch spreadsheet data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 