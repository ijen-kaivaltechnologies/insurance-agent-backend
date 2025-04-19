const express = require('express');
const router = express.Router();
const auth = require('./authRoutes').auth; // Import JWT auth middleware
const notificationController = require('../controllers/notificationController');

// WhatsApp Notification Routes
// router.route('/whatsapp')
//     .post(auth, notificationController.sendWhatsAppReminder); // Send single WhatsApp reminder

// router.route('/whatsapp/bulk')
//     .post(auth, notificationController.sendBulkWhatsAppReminders); // Send bulk WhatsApp reminders

// // Email Notification Routes (Future implementation)
// router.route('/email')
//     .post(auth, async (req, res) => {
//         try {
//             const { client_id, subject, message } = req.body;
            
//             // Validate input
//             if (!client_id || !subject || !message) {
//                 return res.status(400).json({ message: 'client_id, subject, and message are required' });
//             }

//             // Get client's email
//             const client = await Insurance.findOne({
//                 _id: client_id,
//                 userId: req.user.id
//             });

//             if (!client) {
//                 return res.status(404).json({ message: 'Client not found' });
//             }

//             if (!client.email) {
//                 return res.status(400).json({ message: 'Client does not have an email address' });
//             }

//             // TODO: Implement email sending logic
//             // This would typically use an email service provider like SendGrid or Nodemailer

//             res.status(200).json({
//                 message: 'Email notification sent successfully',
//                 to: client.email
//             });
//         } catch (error) {
//             res.status(500).json({ 
//                 message: 'Failed to send email notification',
//                 error: error.message 
//             });
//         }
//     });

// // Notification History Routes
// router.route('/history')
//     .get(auth, async (req, res) => {
//         try {
//             const { type, startDate, endDate } = req.query;
//             const query = {
//                 userId: req.user.id
//             };

//             // Build query based on filters
//             if (type) {
//                 query.type = type; // 'whatsapp' or 'email'
//             }
//             if (startDate) {
//                 query.sentAt = { $gte: new Date(startDate) };
//             }
//             if (endDate) {
//                 query.sentAt = query.sentAt || {};
//                 query.sentAt.$lte = new Date(endDate);
//             }

//             // TODO: Implement notification history query
//             // This would typically query a notifications collection/table

//             res.status(200).json({
//                 message: 'Notification history retrieved successfully',
//                 notifications: [] // Empty array until implemented
//             });
//         } catch (error) {
//             res.status(500).json({ 
//                 message: 'Failed to retrieve notification history',
//                 error: error.message 
//             });
//         }
//     });

// // Scheduled Notifications Routes
// router.route('/scheduled')
//     .post(auth, async (req, res) => {
//         try {
//             const { type, client_id, message, scheduleDate } = req.body;
            
//             // Validate input
//             if (!type || !client_id || !message || !scheduleDate) {
//                 return res.status(400).json({ message: 'type, client_id, message, and scheduleDate are required' });
//             }

//             // Validate notification type
//             const validTypes = ['whatsapp', 'email'];
//             if (!validTypes.includes(type)) {
//                 return res.status(400).json({ message: 'Invalid notification type' });
//             }

//             // TODO: Implement scheduled notification creation
//             // This would typically store the scheduled notification in a database
//             // and use a background job/worker to send it at the scheduled time

//             res.status(201).json({
//                 message: 'Scheduled notification created successfully',
//                 scheduledAt: scheduleDate
//             });
//         } catch (error) {
//             res.status(500).json({ 
//                 message: 'Failed to create scheduled notification',
//                 error: error.message 
//             });
//         }
//     });

// // Notification Templates Routes (for future implementation)
// router.route('/templates')
//     .get(auth, async (req, res) => {
//         try {
//             // TODO: Implement template listing
//             res.status(200).json({
//                 message: 'Notification templates retrieved successfully',
//                 templates: [] // Empty array until implemented
//             });
//         } catch (error) {
//             res.status(500).json({ 
//                 message: 'Failed to retrieve notification templates',
//                 error: error.message 
//             });
//         }
//     })
//     .post(auth, async (req, res) => {
//         try {
//             const { name, type, content, variables } = req.body;
            
//             // TODO: Implement template creation
//             res.status(201).json({
//                 message: 'Notification template created successfully'
//             });
//         } catch (error) {
//             res.status(500).json({ 
//                 message: 'Failed to create notification template',
//                 error: error.message 
//             });
//         }
//     });

module.exports = router;