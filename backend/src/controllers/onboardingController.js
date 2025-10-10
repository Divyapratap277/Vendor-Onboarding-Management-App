const OnboardingToken = require('../models/OnboardingToken');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper function to generate a signed PDF of the onboarding form
const generateSignedOnboardingPdf = async (onboardingData, digitalSignature) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = 18;
  let y = page.getHeight() - 50;
  const x = 50;

  page.drawText('Vendor Onboarding Application Summary', { x, y, font, size: 24, color: rgb(0, 0.53, 0.71) });
  y -= 30;

  const drawField = (label, value) => {
    page.drawText(`${label}: ${value}`, { x, y, font, size: fontSize, color: rgb(0, 0, 0) });
    y -= lineHeight;
  };

  drawField('Business Name', onboardingData.businessName);
  if (onboardingData.businessRegistrationNumber) {
    drawField('Business Registration Number', onboardingData.businessRegistrationNumber);
  }
  drawField('Contact Person', onboardingData.contactPerson);
  drawField('Contact Email', onboardingData.contactEmail);
  drawField('Contact Phone', onboardingData.contactPhone);
  if (onboardingData.alternatePhone) {
    drawField('Alternate Phone', onboardingData.alternatePhone);
  }

  y -= lineHeight; // Spacer
  page.drawText('Address:', { x, y, font, size: fontSize + 2, color: rgb(0, 0, 0) });
  y -= lineHeight;
  drawField('  Street', onboardingData.address.street);
  drawField('  City', onboardingData.address.city);
  drawField('  State', onboardingData.address.state);
  drawField('  Zip Code', onboardingData.address.zipCode);
  drawField('  Country', onboardingData.address.country);

  y -= lineHeight; // Spacer
  const services = onboardingData.servicesOffered || [];
  drawField('Services Offered', services.join(', '));

  y -= lineHeight; // Spacer
  page.drawText('Bank Details:', { x, y, font, size: fontSize + 2, color: rgb(0, 0, 0) });
  y -= lineHeight;
  drawField('  Account Holder', onboardingData.bankDetails.accountHolderName);
  drawField('  Account Number', onboardingData.bankDetails.accountNumber);
  drawField('  IFSC Code', onboardingData.bankDetails.ifscCode);
  drawField('  Bank Name', onboardingData.bankDetails.bankName);
  drawField('  Branch', onboardingData.bankDetails.branch);

  // Add Digital Signature
  y -= lineHeight * 2; // Spacer
  page.drawText('Digital Signature:', { x, y, font, size: fontSize + 2, color: rgb(0, 0, 0) });
  y -= lineHeight;
  page.drawText(`Signed by: ${digitalSignature}`, { x, y, font, size: fontSize, color: rgb(0, 0, 0) });
  y -= lineHeight;
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x, y, font, size: fontSize, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

exports.initiateOnboarding = async (req, res) => {
  try {
    const { vendorName, vendorEmail } = req.body;
    console.log('Initiate onboarding request:', { vendorName, vendorEmail });

    if (!vendorName || !vendorEmail) {
      return res.status(400).json({ message: 'Vendor name and email are required' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour
    
    console.log('Creating onboarding token:', {
      token: token.substring(0, 10) + '...',
      expiresAt: new Date(expiresAt),
      currentTime: new Date()
    });

    const onboardingToken = new OnboardingToken({
      vendorName,
      vendorEmail,
      token,
      expiresAt,
    });

    await onboardingToken.save();
    console.log('Token saved successfully with ID:', onboardingToken._id);

    res.status(200).json({ message: 'Onboarding initiated successfully', token });
  } catch (error) {
    console.error('Error initiating onboarding:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('Token verification request for token:', token);

    let onboardingToken;
    try {
      onboardingToken = await OnboardingToken.findOne({ token });
      console.log('OnboardingToken.findOne result:', onboardingToken);
    } catch (dbError) {
      console.error('Error during OnboardingToken.findOne:', dbError);
      return res.status(500).json({ message: 'Database error', error: dbError });
    }

    console.log('Found onboarding token:', onboardingToken ? {
      id: onboardingToken._id,
      expiresAt: onboardingToken.expiresAt,
      currentTime: new Date(),
      isExpired: onboardingToken.expiresAt < Date.now()
    } : 'null');

    if (!onboardingToken) {
      console.log('Token validation failed - token not found');
      return res.status(404).json({ valid: false, message: 'Invalid or expired token' });
    }

    if (onboardingToken.expiresAt < Date.now()) {
      console.log('Token validation failed - token expired');
      return res.status(404).json({ valid: false, message: 'Invalid or expired token' });
    }

    console.log('Token validation successful');
    res.status(200).json({ valid: true, vendorName: onboardingToken.vendorName, vendorEmail: onboardingToken.vendorEmail });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.generateUploadPresignedUrl = async (req, res) => {
  try {
    const { token, fileName, fileType } = req.body;

    if (!token || !fileName || !fileType) {
      return res.status(400).json({ message: 'Token, file name, and file type are required.' });
    }

    const onboardingToken = await OnboardingToken.findOne({ token });
    if (!onboardingToken || onboardingToken.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired onboarding token.' });
    }

    // For local storage, we just return a temporary file path
    const fileKey = `onboarding-documents/${onboardingToken._id}/${Date.now()}-${fileName}`;
    const filePath = path.join(UPLOAD_DIR, fileKey);

    // Create necessary subdirectories
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Return a dummy URL and the fileKey (which is now a local path)
    res.status(200).json({ success:true, uploadUrl: `http://localhost:5000/uploads/${fileKey}`, fileKey: `uploads/${fileKey}` });
  } catch (error) {
    console.error('Server error in generateUploadPresignedUrl:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.confirmDocumentUpload = async (req, res) => {
  try {
    const { token } = req.body;
    const file = req.file; // Multer adds file info to req.file

    if (!token || !file) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path); // Clean up orphaned file
      }
      return res.status(400).json({ message: 'Token and uploaded file are required.' });
    }

    const onboardingToken = await OnboardingToken.findOne({ token });
    if (!onboardingToken || onboardingToken.expiresAt < Date.now()) {
      // If token is invalid, delete the uploaded file
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ message: 'Invalid or expired onboarding token.' });
    }

    const relativePath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, '/');

    // The document is pushed to the token for temporary tracking
    onboardingToken.documents.push({
      fileName: file.originalname,
      fileKey: relativePath,
      fileType: file.mimetype,
    });
    await onboardingToken.save();

    // The URL is constructed for the frontend to use for display
    const fileUrl = `http://localhost:5000/uploads/${relativePath}`;

    res.status(200).json({
      message: 'Document uploaded and details saved.',
      fileKey: relativePath,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileUrl: fileUrl, // Send back a full URL for viewing
    });
  } catch (error) {
    console.error('Server error in confirmDocumentUpload:', error);
    // If there's an error after file upload, we should probably delete the file
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const { token, businessName, businessRegistrationNumber, contactPerson, contactEmail, contactPhone, alternatePhone, address, servicesOffered, bankDetails, password, digitalSignature, documents } = req.body;

    const onboardingToken = await OnboardingToken.findOne({ token });

    if (!onboardingToken || onboardingToken.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired onboarding token.' });
    }

    // Generate and save the signed PDF locally
    const onboardingPdfBytes = await generateSignedOnboardingPdf(req.body, digitalSignature);
    const pdfFileName = `onboarding-summary-${onboardingToken._id}.pdf`;
    const pdfFileKey = path.join('onboarding-documents', onboardingToken._id.toString(), pdfFileName);
    const pdfFilePath = path.join(UPLOAD_DIR, pdfFileKey);

    // Ensure directory exists for PDF
    const pdfDir = path.dirname(pdfFilePath);
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    fs.writeFileSync(pdfFilePath, onboardingPdfBytes);

    let vendor = await Vendor.findOne({ contactEmail });

    if (vendor) {
      // If vendor exists, update their details
      vendor.businessName = businessName;
      vendor.businessRegistrationNumber = businessRegistrationNumber;
      vendor.contactPerson = contactPerson;
      vendor.contactPhone = contactPhone;
      vendor.alternatePhone = alternatePhone;
      vendor.address = address;
      vendor.servicesOffered = servicesOffered;
      vendor.bankDetails = bankDetails;
      vendor.digitalSignature = digitalSignature; // Save the signature
      vendor.status = 'pending'; // Reset status to pending for re-approval
      vendor.documents = [
        ...documents,
        { fileName: pdfFileName, fileKey: pdfFileKey, fileType: 'application/pdf' },
      ];

      await vendor.save();

      // Update user password if provided
      let user = await User.findById(vendor.user);
      if (user && password) {
        user.password = password;
        await user.save();
      }
      
      // Invalidate the onboarding token
      await OnboardingToken.deleteOne({ token });

      // Send response for updated vendor
      return res.status(200).json({ message: 'Vendor profile updated successfully. It is now pending re-approval.', vendorId: vendor._id });

    } else {
      // If no vendor exists, create a new user and vendor
      let user = await User.findOne({ email: contactEmail });
      if (user) {
        return res.status(400).json({ message: 'A user with this email already exists, but no corresponding vendor profile was found.' });
      }

      user = new User({
        name: contactPerson,
        email: contactEmail,
        password, // Hashed in pre-save hook
        role: 'vendor',
      });
      await user.save();

      vendor = new Vendor({
        user: user._id,
        businessName,
        businessRegistrationNumber,
        contactPerson,
        contactEmail,
        contactPhone,
        alternatePhone,
        address,
        servicesOffered,
        bankDetails,
        digitalSignature, // Save the signature
        status: 'pending',
        documents: [
          ...(documents || []),
          { fileName: pdfFileName, fileKey: pdfFileKey, fileType: 'application/pdf' },
        ],
      });
      await vendor.save();
      
      // Invalidate the onboarding token
      await OnboardingToken.deleteOne({ token });

      // Send response for new vendor
      return res.status(201).json({ success:true, message: 'Vendor onboarding completed successfully. User account created.', vendor: { vendorId: vendor._id, userId: user._id } });
    }

  }  catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Server error during onboarding completion', error: error.message });
  }
};