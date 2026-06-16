import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не знайдено' }, { status: 400 });
    }

    // 1. Авторизація через OAuth2 (тепер ти вантажиш ВІД СВОГО ІМЕНІ)
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID as string,
      process.env.GOOGLE_CLIENT_SECRET as string
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN as string,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 2. Конвертуємо файл
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // 3. Метадані (назва файлу та в яку папку покласти)
    const fileMetadata = {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string], // 🟢 Кажемо TypeScript, що це точно текст
    };

    const media = {
      mimeType: file.type,
      body: stream,
    };

    // 4. Завантаження на Google Диск
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    const fileId = driveResponse.data.id;

    // 5. Робимо файл публічно доступним
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return NextResponse.json({ url: driveResponse.data.webViewLink });

  } catch (error: any) {
    console.error('Помилка Google Drive:', error);
    return NextResponse.json({ error: 'Помилка при завантаженні файлу' }, { status: 500 });
  }
}