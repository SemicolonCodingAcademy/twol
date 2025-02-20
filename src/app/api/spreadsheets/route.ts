import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'FOLDER_ID';

async function getAuthClient() {
  try {
    console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL);
    console.log('Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
    // Log first and last few characters of private key to verify it's present
    const pk = process.env.GOOGLE_PRIVATE_KEY || '';
    console.log('Private Key Length:', pk.length);
    console.log('Private Key Start:', pk.substring(0, 50));
    console.log('Private Key End:', pk.substring(pk.length - 50));

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
    const auth = await getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name)',
    });

    const files = response.data.files || [];
    return NextResponse.json(files.map(file => ({
      id: file.id,
      name: file.name,
    })));
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    // Return more detailed error information
    return NextResponse.json({ 
      error: 'Failed to fetch spreadsheets',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 