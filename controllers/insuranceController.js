const Insurance = require('../models/insurance');

// Create a new insurance client
const createClient = async (req, res) => {
    try {
        const { name, email, phone, address, insuranceType, startDate, endDate, premiumAmount } = req.body;
        
        const client = new Insurance({
            name,
            email,
            phone,
            address,
            insuranceType,
            startDate,
            endDate,
            premiumAmount,
            userId: req.user.id // Assuming this is an authenticated API
        });

        const savedClient = await client.save();
        res.status(201).json(savedClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all insurance clients
const getAllClients = async (req, res) => {
    try {
        const clients = await Insurance.find({ userId: req.user.id });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single insurance client by ID
const getClientById = async (req, res) => {
    try {
        const client = await Insurance.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an insurance client
const updateClient = async (req, res) => {
    try {
        const client = await Insurance.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const { name, email, phone, address, insuranceType, startDate, endDate, premiumAmount } = req.body;

        client.name = name || client.name;
        client.email = email || client.email;
        client.phone = phone || client.phone;
        client.address = address || client.address;
        client.insuranceType = insuranceType || client.insuranceType;
        client.startDate = startDate || client.startDate;
        client.endDate = endDate || client.endDate;
        client.premiumAmount = premiumAmount || client.premiumAmount;

        const updatedClient = await client.save();
        res.json(updatedClient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an insurance client
const deleteClient = async (req, res) => {
    try {
        const client = await Insurance.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        await client.remove();
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
};