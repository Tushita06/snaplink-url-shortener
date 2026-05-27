const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const mongoose = require('mongoose');

// Helper to get start of day for a date offset
const getStartDateForDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Get aggregated dashboard statistics for current user
// @route   GET /api/analytics/dashboard
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user's URLs
    const userUrls = await Url.find({ userId });
    const urlIds = userUrls.map(u => u._id);

    // If user has no URLs, return empty initial stats
    if (urlIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalLinks: 0,
          totalClicks: 0,
          mostActiveLink: null,
          recentClicks: [],
          timeline: [],
          devices: [],
          browsers: [],
          countries: []
        }
      });
    }

    // 2. Count total clicks
    const totalClicks = userUrls.reduce((sum, url) => sum + url.clicks, 0);

    // Find the most active link (max clicks)
    const sortedByClicks = [...userUrls].sort((a, b) => b.clicks - a.clicks);
    const mostActiveLink = sortedByClicks[0].clicks > 0 ? {
      id: sortedByClicks[0]._id,
      title: sortedByClicks[0].title,
      shortCode: sortedByClicks[0].shortCode,
      clicks: sortedByClicks[0].clicks
    } : null;

    // 3. Aggregate Timeline (Clicks past 7 days)
    const timelineStartDate = getStartDateForDays(7);
    const timeline = await Analytics.aggregate([
      { 
        $match: { 
          urlId: { $in: urlIds },
          timestamp: { $gte: timelineStartDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          clicks: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing dates in timeline (so chart doesn't look empty or disconnected)
    const timelineMap = new Map(timeline.map(t => [t.date, t.clicks]));
    const completeTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      completeTimeline.push({
        date: dateString,
        clicks: timelineMap.get(dateString) || 0
      });
    }

    // 4. Aggregate Device splits
    const devices = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds } } },
      { $group: { _id: "$device", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    // 5. Aggregate Browser splits
    const browsers = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds } } },
      { $group: { _id: "$browser", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 5 } // Top 5 browsers
    ]);

    // 6. Aggregate Country splits
    const countries = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds } } },
      { $group: { _id: "$country", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 6 } // Top 6 countries
    ]);

    // 7. Recent Clicks Log (Last 10 visits)
    const recentClicks = await Analytics.find({ urlId: { $in: urlIds } })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('urlId', 'shortCode originalUrl title');

    res.status(200).json({
      success: true,
      stats: {
        totalLinks: urlIds.length,
        totalClicks,
        mostActiveLink,
        recentClicks,
        timeline: completeTimeline,
        devices,
        browsers,
        countries
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed statistics for a single URL
// @route   GET /api/analytics/url/:urlId
// @access  Private
const getIndividualStats = async (req, res, next) => {
  try {
    const { urlId } = req.params;
    const userId = req.user._id;

    // Verify ownership
    const url = await Url.findOne({ _id: urlId, userId });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found or unauthorized' });
    }

    // 1. Daily clicks Timeline past 7 days
    const timelineStartDate = getStartDateForDays(7);
    const timeline = await Analytics.aggregate([
      { 
        $match: { 
          urlId: new mongoose.Types.ObjectId(urlId),
          timestamp: { $gte: timelineStartDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          clicks: 1,
          _id: 0
        }
      }
    ]);

    // Fill missing dates
    const timelineMap = new Map(timeline.map(t => [t.date, t.clicks]));
    const completeTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      completeTimeline.push({
        date: dateString,
        clicks: timelineMap.get(dateString) || 0
      });
    }

    // 2. Devices breakdown
    const devices = await Analytics.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(urlId) } },
      { $group: { _id: "$device", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    // 3. Browsers breakdown
    const browsers = await Analytics.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(urlId) } },
      { $group: { _id: "$browser", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    // 4. Countries breakdown
    const countries = await Analytics.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(urlId) } },
      { $group: { _id: "$country", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 6 }
    ]);

    // 5. Recent Clicks Log (last 20 items)
    const clickLogs = await Analytics.find({ urlId })
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      url,
      stats: {
        totalClicks: url.clicks,
        timeline: completeTimeline,
        devices,
        browsers,
        countries,
        clickLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getIndividualStats
};
