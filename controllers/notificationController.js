const Insurance = require('../models/insurance');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// Send WhatsApp reminder to a client
const sendWhatsAppReminder = async (req, res) => {
    try {
        const { client_id, message } = req.body;

        // Validate input
        if (!client_id || !message) {
            return res.status(400).json({ message: 'client_id and message are required' });
        }

        // Get client's phone number
        const client = await Insurance.findOne({
            _id: client_id,
            userId: req.user.id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (!client.phone) {
            return res.status(400).json({ message: 'Client does not have a phone number' });
        }

        // Send WhatsApp message using service
        const result = await sendWhatsAppMessage(client.phone, message);

        if (result.success) {
            res.status(200).json({
                message: 'WhatsApp notification sent successfully',
                messageSid: result.sid,
                status: result.status
            });
        } else {
            res.status(500).json({
                message: 'Failed to send WhatsApp notification',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to send WhatsApp notification',
            error: error.message 
        });
    }
};

// Send bulk WhatsApp reminders
const sendBulkWhatsAppReminders = async (req, res) => {
    try {
        const { message, filters } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'message is required' });
        }

        // Build query based on filters
        const query = { userId: req.user.id };
        if (filters.insuranceType) {
            query.insuranceType = filters.insuranceType;
        }
        if (filters.status) {
            query.status = filters.status;
        }

        // Get all clients matching the criteria
        const clients = await Insurance.find(query);
        
        // Send message to each client
        const results = [];
        for (const client of clients) {
            if (!client.phone) continue;
            
            const result = await sendWhatsAppMessage(client.phone, message);
            results.push({
                clientId: client._id,
                success: result.success,
                messageSid: result.success ? result.sid : null,
                status: result.success ? result.status : null,
                error: !result.success ? result.error : null
            });
        }

        res.status(200).json({
            message: 'Bulk WhatsApp notifications sent successfully',
            results
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to send bulk WhatsApp notifications',
            error: error.message 
        });
    }
};

module.exports = {
    sendWhatsAppReminder,
    sendBulkWhatsAppReminders
};