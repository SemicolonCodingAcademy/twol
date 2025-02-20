import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

function extractDateFromFilename(filename: string): Date | null {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? new Date(match[1]) : null;
}

async function getAuthClient() {
  try {
    // Remove any extra quotes from the environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.replace(/^["']|["']$/g, '');
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');

    console.log('Auth Debug Info:');
    console.log('Client Email present:', !!clientEmail);
    console.log('Private Key present:', !!privateKey);
    console.log('Folder ID:', FOLDER_ID);
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
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ],
    });

    return auth;
  } catch (error) {
    console.error('Auth Error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    if (!FOLDER_ID) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set');
    }

    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    console.log('Fetching spreadsheets from folder:', FOLDER_ID);
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name)',
      orderBy: 'name desc'
    });

    const files = response.data.files || [];
    console.log('Found spreadsheets:', files.length);

    // Sort files by date in filename
    const sortedFiles = files
      .map(file => ({
        id: file.id,
        name: file.name || '',
        date: extractDateFromFilename(file.name || '')
      }))
      .filter(file => file.date !== null)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.getTime() - a.date.getTime(); // Sort in descending order (newest first)
      });

    return NextResponse.json(sortedFiles.map(file => ({
      id: file.id,
      name: file.name,
    })));
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch spreadsheets',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 