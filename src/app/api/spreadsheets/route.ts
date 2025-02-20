import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'FOLDER_ID';

async function getAuthClient() {
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
    return NextResponse.json({ error: 'Failed to fetch spreadsheets' }, { status: 500 });
  }
} 