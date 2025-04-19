const PolicyType = require('../models/policyType');

// Get all policy types
const getAllPolicyTypes = async (req, res) => {
    try {
        const policyTypes = await PolicyType.findAll();
        res.json(policyTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single policy type by ID
const getPolicyTypeById = async (req, res) => {
    try {
        const policyType = await PolicyType.findById(req.params.id);
        
        if (!policyType) {
            return res.status(404).json({ message: 'Policy type not found' });
        }
        
        res.json(policyType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a policy type by name
const getPolicyTypeByName = async (req, res) => {
    try {
        const policyType = await PolicyType.findByName(req.params.name);
        
        if (!policyType) {
            return res.status(404).json({ message: 'Policy type not found' });
        }
        
        res.json(policyType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new policy type
const createPolicyType = async (req, res) => {
    try {
        const { name, description, coverage, premiumRate } = req.body;
        
        // Check if policy type already exists
        const existingType = await PolicyType.findByName(name);
        if (existingType) {
            return res.status(400).json({ message: 'Policy type already exists' });
        }

        const query = `
            INSERT INTO policy_types (name, description, coverage, premium_rate)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        
        const values = [name, description, coverage, premiumRate];
        
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a policy type
const updatePolicyType = async (req, res) => {
    try {
        const { name, description, coverage, premiumRate } = req.body;
        const policyType = await PolicyType.findById(req.params.id);
        
        if (!policyType) {
            return res.status(404).json({ message: 'Policy type not found' });
        }

        const query = `
            UPDATE policy_types
            SET name = $1,
                description = $2,
                coverage = $3,
                premium_rate = $4
            WHERE id = $5
            RETURNING *`;
        
        const values = [name, description, coverage, premiumRate, req.params.id];
        
        const result = await db.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a policy type
const deletePolicyType = async (req, res) => {
    try {
        const policyType = await PolicyType.findById(req.params.id);
        
        if (!policyType) {
            return res.status(404).json({ message: 'Policy type not found' });
        }

        const query = 'DELETE FROM policy_types WHERE id = $1';
        await db.query(query, [req.params.id]);
        
        res.json({ message: 'Policy type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPolicyTypes,
    getPolicyTypeById,
    getPolicyTypeByName,
    createPolicyType,
    updatePolicyType,
    deletePolicyType
};