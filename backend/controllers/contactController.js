const Contact = require('../models/Contact');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/email');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Temporary upload directory for Lambda
const TEMP_UPLOADS_DIR = '/tmp/uploads';
if (!fs.existsSync(TEMP_UPLOADS_DIR)) fs.mkdirSync(TEMP_UPLOADS_DIR, { recursive: true });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume uploads'));
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// Upload file to S3
const uploadFileToS3 = async (filePath, fileName, mimeType) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `resumes/${fileName}`,
    Body: fileContent,
    ContentType: mimeType,
    ACL: 'private',
  };
  const data = await s3.upload(params).promise();
  return data.Location;
};

// --------------------- Controller Functions ---------------------

// Submit contact form
const submitContact = async (req, res) => {
  let uploadedFilePath = null;
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || (type !== 'resume' && !message?.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return res.status(400).json({ success: false, message: 'Invalid email' });

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message?.trim() || (type === 'resume' ? 'No message' : ''),
      type: type || 'contact',
    };

    // Handle resume upload
    if (req.file) {
      uploadedFilePath = req.file.path;
      const s3Url = await uploadFileToS3(req.file.path, req.file.filename, req.file.mimetype);
      contactData.resume = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: s3Url,
      };
    }

    const contact = await Contact.create(contactData);

    // Send email for resume submissions
    if (req.file && type === 'resume') {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New Job Application: ${subject}`,
          html: `<p>${name} applied for ${subject}. <a href="${contactData.resume.url}">Download Resume</a></p>`,
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    res.status(201).json({ success: true, message: 'Submission successful', data: contact });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit form', error: error.message });
  } finally {
    if (uploadedFilePath) fs.unlink(uploadedFilePath, (err) => err && console.error('Failed to delete temp file:', err));
  }
};

// Get all submissions (Admin)
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

// Get single submission (Admin)
const getSubmission = async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch submission', error: error.message });
  }
};

// Update submission status (Admin)
const updateSubmissionStatus = async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    submission.status = req.body.status || submission.status;
    await submission.save();
    res.status(200).json({ success: true, message: 'Status updated', data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// Reply to submission (Admin)
const replyToSubmission = async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    await sendEmail({
      to: submission.email,
      subject: req.body.subject || 'Response from Admin',
      html: req.body.message || 'Admin replied to your submission.',
    });

    res.status(200).json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send reply', error: error.message });
  }
};

// Delete submission (Admin)
const deleteSubmission = async (req, res) => {
  try {
    const submission = await Contact.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    // Delete resume from S3 if exists
    if (submission.resume?.filename) {
      const params = { Bucket: process.env.S3_BUCKET_NAME, Key: `resumes/${submission.resume.filename}` };
      try { await s3.deleteObject(params).promise(); } catch (s3Error) { console.error('S3 delete error:', s3Error); }
    }

    await submission.deleteOne();
    res.status(200).json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete submission', error: error.message });
  }
};

// --------------------- Export ---------------------
module.exports = {
  submitContact,
  getSubmissions,
  getSubmission,
  updateSubmissionStatus,
  replyToSubmission,
  deleteSubmission,
  upload,
};
