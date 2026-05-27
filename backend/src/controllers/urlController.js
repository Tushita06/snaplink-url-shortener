const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { generateShortCode, isValidUrl, extractTitleFromUrl } = require('../utils/codeGenerator');

// @desc    Create a new shortened URL
// @route   POST /api/urls
// @access  Private
const createUrl = async (req, res, next) => {
  try {
    let { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a destination URL' });
    }

    // Trim inputs
    originalUrl = originalUrl.trim();
    if (customAlias) {
      customAlias = customAlias.trim().toLowerCase();
    }

    // Standardize URL with http/https if missing
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'https://' + originalUrl;
    }

    // Validate URL syntax
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL syntax' });
    }

    let finalShortCode = '';

    // Handle Custom Alias
    if (customAlias) {
      // Validate alias format (alphanumeric, dashes, underscores, between 3 and 20 chars)
      const aliasRegex = /^[a-zA-Z0-9-_]{3,20}$/;
      if (!aliasRegex.test(customAlias)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Custom alias must be alphanumeric, dashes, or underscores, between 3 and 20 characters.' 
        });
      }

      // Check duplicate in both shortCode and customAlias
      const aliasExists = await Url.findOne({
        $or: [
          { shortCode: customAlias },
          { customAlias: customAlias }
        ]
      });

      if (aliasExists) {
        return res.status(400).json({ success: false, message: 'Custom alias is already in use' });
      }

      finalShortCode = customAlias;
    } else {
      // Generate automatic unique short code
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const potentialCode = generateShortCode();
        
        // Ensure no collision in database
        const codeExists = await Url.findOne({
          $or: [
            { shortCode: potentialCode },
            { customAlias: potentialCode }
          ]
        });

        if (!codeExists) {
          finalShortCode = potentialCode;
          isUnique = true;
        }
        attempts++;
      }

      if (!finalShortCode) {
        return res.status(500).json({ success: false, message: 'Failed to generate a unique short code. Please try again.' });
      }
    }

    // Parse Expiry Date
    let parsedExpiry = null;
    if (expiresAt) {
      parsedExpiry = new Date(expiresAt);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date format' });
      }
      if (parsedExpiry <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future' });
      }
    }

    // Auto extract visual title from destination
    const autoTitle = extractTitleFromUrl(originalUrl);

    // Save URL document
    const url = await Url.create({
      originalUrl,
      shortCode: finalShortCode,
      customAlias: customAlias || undefined,
      title: autoTitle,
      userId: req.user._id,
      expiresAt: parsedExpiry
    });

    res.status(201).json({
      success: true,
      url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all URLs of current user with search & filters
// @route   GET /api/urls
// @access  Private
const getUserUrls = async (req, res, next) => {
  try {
    const { search, filter } = req.query;
    
    // Base query for user-wise isolation
    let query = { userId: req.user._id };

    // Implement searching
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Implement filtering (Active, Expired)
    const now = new Date();
    if (filter === 'active') {
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ];
    } else if (filter === 'expired') {
      query.expiresAt = { $ne: null, $lte: now };
    }

    // Find URLs sorted by latest first
    const urls = await Url.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: urls.length,
      urls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit/Update target URL destination path
// @route   PUT /api/urls/:id
// @access  Private
const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { originalUrl, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a destination URL' });
    }

    originalUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'https://' + originalUrl;
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid URL syntax' });
    }

    // Find URL and check ownership
    let url = await Url.findOne({ _id: id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    // Handle expiry updates
    let parsedExpiry = url.expiresAt;
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '') {
        parsedExpiry = null;
      } else {
        parsedExpiry = new Date(expiresAt);
        if (isNaN(parsedExpiry.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid expiry date format' });
        }
        if (parsedExpiry <= new Date()) {
          return res.status(400).json({ success: false, message: 'Expiry date must be in the future' });
        }
      }
    }

    // Auto extract new visual title
    const newTitle = extractTitleFromUrl(originalUrl);

    // Update document
    url.originalUrl = originalUrl;
    url.title = newTitle;
    url.expiresAt = parsedExpiry;
    await url.save();

    res.status(200).json({
      success: true,
      url
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL and clean associated analytics history
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find URL and check ownership
    const url = await Url.findOne({ _id: id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    // Cascade delete: Delete associated analytics click history first
    await Analytics.deleteMany({ urlId: id });

    // Delete the URL document
    await Url.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'URL and associated click history deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUrl,
  getUserUrls,
  updateUrl,
  deleteUrl
};
