import { google } from 'googleapis'
import type { Transaction } from './schemas'

interface DriveBuyerConfig {
  transaction_folder_format: string
  info_sheet_filename_format: string
}

interface DriveFolder {
  id: string
  name: string
}

interface DriveSuccessResult {
  success: true
  drive_folder_id: string
  drive_folder_url: string
  info_sheet_file_id: string
}

interface DriveErrorResult {
  success: false
  error: string
  error_code: string
  folders?: DriveFolder[]
}

type DriveResult = DriveSuccessResult | DriveErrorResult

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

function formatName(template: string, transaction: Transaction): string {
  return template
    .replace('{short_address}', transaction.short_address ?? transaction.property_address ?? 'Unknown')
    .replace('{client_name}', transaction.client_name ?? 'Unknown')
    .replace('{close_date}', transaction.close_date ?? 'Unknown')
    .replace('{agent_name}', transaction.agent_name ?? 'Unknown')
}

export async function createDriveFolders(
  transaction: Transaction,
  config: DriveBuyerConfig,
  pdfBuffer?: Buffer,
  agentFolderIdOverride?: string
): Promise<DriveResult> {
  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!
  const agentName = transaction.agent_name ?? ''

  let agentFolderId: string

  if (agentFolderIdOverride) {
    agentFolderId = agentFolderIdOverride
  } else {
    // Search for agent folder
    const agentSearchRes = await drive.files.list({
      q: `name contains "${agentName} Transactions" and mimeType = 'application/vnd.google-apps.folder' and "${rootFolderId}" in parents and trashed = false`,
      fields: 'files(id, name)',
    })

    const agentFolders = agentSearchRes.data.files ?? []

    if (agentFolders.length === 0) {
      return {
        success: false,
        error: `Could not find ${agentName}'s Drive folder. Check the agent name or create the folder manually.`,
        error_code: 'agent_folder_not_found',
      }
    }

    if (agentFolders.length > 1) {
      return {
        success: false,
        error: `Multiple Drive folders found for ${agentName} — select the correct one.`,
        error_code: 'agent_folder_ambiguous',
        folders: agentFolders.map(f => ({ id: f.id!, name: f.name! })),
      }
    }

    agentFolderId = agentFolders[0].id!
  }

  // Find "2. Under Contract" stage subfolder
  const stageRes = await drive.files.list({
    q: `name = "2. Under Contract" and mimeType = 'application/vnd.google-apps.folder' and "${agentFolderId}" in parents and trashed = false`,
    fields: 'files(id)',
  })

  const stageFolders = stageRes.data.files ?? []
  if (stageFolders.length === 0) {
    return {
      success: false,
      error: `Could not find '2. Under Contract' inside ${agentName}'s folder.`,
      error_code: 'stage_folder_not_found',
    }
  }

  const stageFolderId = stageFolders[0].id!

  // Create transaction folder
  const folderName = formatName(config.transaction_folder_format, transaction)
  const folderRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [stageFolderId],
    },
    fields: 'id, webViewLink',
  })

  const transactionFolderId = folderRes.data.id!
  const transactionFolderUrl = folderRes.data.webViewLink!

  // Upload PDF if buffer provided
  let infoSheetFileId = ''
  if (pdfBuffer) {
    const fileName = formatName(config.info_sheet_filename_format, transaction)
    const uploadRes = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [transactionFolderId],
      },
      media: {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(pdfBuffer),
      },
      fields: 'id',
    })
    infoSheetFileId = uploadRes.data.id!
  }

  return {
    success: true,
    drive_folder_id: transactionFolderId,
    drive_folder_url: transactionFolderUrl,
    info_sheet_file_id: infoSheetFileId,
  }
}
