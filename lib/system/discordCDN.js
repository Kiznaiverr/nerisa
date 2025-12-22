const axios = require('axios')
const FormData = require('form-data')
const { fileTypeFromBuffer } = require('file-type')

/**
 * Upload image buffer to Discord channel as a file attachment.
 * Supported mimetypes: image/jpeg, image/jpg, image/png.
 * @param {Buffer} content - The image buffer to upload.
 * @param {string} fileNames - The desired filename without extension.
 * @returns {Promise<Object>} Response object with status, data, or error message.
 * @throws {Error} If content or fileNames is invalid.
 */
const DiscordCDN = async (content, fileNames) => {
  try {
    // Input validation
    if (!content || !Buffer.isBuffer(content)) {
      throw new Error('Invalid content: Must be a Buffer')
    }
    if (!fileNames || typeof fileNames !== 'string') {
      throw new Error('Invalid fileNames: Must be a non-empty string')
    }

    // Detect file type
    const { ext, mime } = await fileTypeFromBuffer(content)
    if (!mime.startsWith('image/')) {
      throw new Error('Unsupported file type: Only images are allowed')
    }

    // Prepare form data
    const formData = new FormData()
    formData.append('files[0]', content, {
      filename: `${fileNames}.${ext}`,
      contentType: mime
    })

    // Send request to Discord API
    const response = await axios.post(
      `https://discord.com/api/v9/channels/${process.env.DISCORD_CHANNEL_ID}/messages`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    )

    // Success response
    return {
      creator: global.creator,
      status: true,
      data: {
        result: response.data
      }
    }
  } catch (error) {
    console.error('DiscordCDN Error:', error.message)
    // Error response
    return {
      creator: global.creator,
      status: false,
      msg: error.message
    }
  }
}

module.exports = DiscordCDN
