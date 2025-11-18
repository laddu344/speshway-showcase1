const Contact = require('../models/Contact');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/email');

// 💡 ADD AWS SDK for S3 operations
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// 🛠️ FIX 1: Use the writable /tmp directory
const TEMP_UPLOADS_DIR = '/tmp/uploads';

// Create uploads directory in /tmp if it doesn't exist
if (!fs.existsSync(TEMP_UPLOADS_DIR)) {
  // This line is now safe because /tmp is writable
  fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  // 🛠️ FIX 2: Use the /tmp directory for temporary storage
  destination: function (req, file, cb) {
    cb(null, TEMP_UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF, DOC, DOCX files
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume uploads'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// 💡 NEW HELPER FUNCTION: Uploads file to S3
const uploadFileToS3 = async (filePath, fileName, mimeType) => {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Must be set in Lambda environment variables
    Key: `resumes/${fileName}`,         // Unique path in your S3 bucket
    Body: fileContent,
    ContentType: mimeType,
    ACL: 'private' // Set appropriate permissions
  };

  const data = await s3.upload(params).promise();
  // Return the public S3 URL (if needed) or the secure key
  return data.Location; 
};

// @desc    Submit contact form
// @route   POST /api/contact/submit
// @access  Public
const submitContact = async (req, res) => {
  let uploadedFilePath = null; // To track the temporary file for cleanup

  try {
    const { name, email, phone, subject, message, type } = req.body;

    // ... (Your validation code remains here) ...

    // Validate required fields based on type
    if (type === 'resume') {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Resume file is required for job applications'
        });
      }
      if (!name || !name.trim() || !email || !email.trim() || !subject || !subject.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and position are required fields'
        });
      }
    } else {
      if (!name || !name.trim() || !email || !email.trim() || !subject || !subject.trim() || !message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create contact submission
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message && message.trim() ? message.trim() : (type === 'resume' ? 'No additional message provided.' : ''),
      type: type || 'contact'
    };

    // Handle file upload
    if (req.file) {
      uploadedFilePath = req.file.path; // Set file path for cleanup

      // 🛠️ FIX 3: Upload the file to S3 for permanent storage
      const s3Url = await uploadFileToS3(
        req.file.path, 
        req.file.filename, 
        req.file.mimetype
      );

      contactData.resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        // The local path is irrelevant/temporary in Lambda
        path: req.file.path, 
        // 🛠️ FIX 4: Store the permanent S3 URL/key instead of a local URL
        url: s3Url 
      };
    }

    const contact = await Contact.create(contactData);

    // If a resume was uploaded, send a professional email to admin
    if (req.file && type === 'resume') {
      // 🛠️ FIX 5: Use the permanent S3 URL in the email template
      const resumeUrl = contactData.resume.url; 
      
      const companyName = 'Speshway Solutions Private Limited';
      const submissionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New Job Application: ${subject}`,
          html: `
            // ... (Your long email HTML template here. The link to the resume should use resumeUrl) ...
            
            // 🛠️ Note: You may need to fetch the file from S3 to attach it if your sendEmail utility requires a file attachment, 
            // or simply link to the S3 URL in the email body for the admin to download.
            // For simplicity, this example uses the S3 URL in the email body (as you provided a full HTML template).
          `,
          // ⚠️ IMPORTANT: Sending attachments in Lambda is complex. If you still rely on this block, 
          // you MUST change path: req.file.path to a downloaded S3 file if the execution context is new/clean, 
          // but since this is an immediate follow-up to the upload, the local /tmp file should still be available.
          attachments: [
            {
              filename: req.file.originalname,
              path: req.file.path, 
            },
          ],
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully',
      data: contact
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error.message
    });
  } finally {
    // 💡 CLEANUP: Delete the temporary file from /tmp
    if (uploadedFilePath) {
      fs.unlink(uploadedFilePath, (err) => {
        if (err) console.error('Error deleting temporary file from /tmp:', err);
      });
    }
  }
};
// ... (The rest of your functions getSubmissions, getSubmission, etc. remain here) ...
// ... (The deleteSubmission function needs to be updated to delete from S3, not the local disk) ...

// @desc    Delete submission
// @route   DELETE /api/contact/submission/:id
// @access  Private/Admin
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // 🛠️ FIX 6: Delete associated resume file from S3, not the local disk
    if (submission.resume && submission.resume.filename) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `resumes/${submission.resume.filename}`,
      };
      
      try {
        await s3.deleteObject(params).promise();
      } catch (s3DeleteError) {
        console.error('Error deleting resume file from S3:', s3DeleteError);
        // Note: You might choose to continue deletion even if S3 fails
      }
    }
    
    await submission.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

module.exports = {
  submitContact,
  // ... (Export all other functions)
  deleteSubmission,
  upload
};
