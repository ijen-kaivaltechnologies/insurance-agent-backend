const express = require('express');
const router = express.Router();
const auth = require('./authRoutes').auth; // Import JWT auth middleware
const policyTypeController = require('../controllers/policyTypeController');

// Policy Type Routes
// router.route('/')
//     .get(auth, policyTypeController.getAllPolicyTypes) // Get all policy types
//     .post(auth, policyTypeController.createPolicyType); // Create new policy type

// router.route('/:id')
//     .get(auth, policyTypeController.getPolicyTypeById) // Get policy type by ID
//     .put(auth, policyTypeController.updatePolicyType) // Update policy type
//     .delete(auth, policyTypeController.deletePolicyType); // Delete policy type

// // Policy Type by Name Route
// router.get('/name/:name', auth, policyTypeController.getPolicyTypeByName);

// // Policy Type Statistics Route
// router.get('/stats', auth, async (req, res) => {
//     try {
//         // Get all policy types
//         const policyTypes = await policyTypeController.getAllPolicyTypes(req, res);
        
//         // Calculate statistics
//         const stats = {
//             totalTypes: policyTypes.length,
//             activePolicies: {},
//             averagePremium: {},
//             mostPopular: null
//         };

//         // TODO: Implement statistics calculation
//         // This would typically involve querying the insurance policies collection
//         // to get counts and averages for each policy type

//         res.status(200).json({
//             message: 'Policy type statistics retrieved successfully',
//             stats
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Failed to retrieve policy type statistics',
//             error: error.message 
//         });
//     }
// });

// // Policy Type Search Route
// router.get('/search', auth, async (req, res) => {
//     try {
//         const { query, limit = 10 } = req.query;
        
//         // TODO: Implement search functionality
//         // This would typically search policy types by name, description, or coverage

//         res.status(200).json({
//             message: 'Policy type search results',
//             results: [] // Empty array until implemented
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Failed to search policy types',
//             error: error.message 
//         });
//     }
// });

// // Policy Type Export Route (CSV/Excel)
// router.get('/export', auth, async (req, res) => {
//     try {
//         // Get all policy types
//         const policyTypes = await policyTypeController.getAllPolicyTypes(req, res);
        
//         // TODO: Implement export functionality
//         // This would typically generate a CSV or Excel file
//         // containing policy type data

//         res.status(200).json({
//             message: 'Policy type export initiated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Failed to export policy types',
//             error: error.message 
//         });
//     }
// });

// // Policy Type Import Route (CSV/Excel)
// router.post('/import', auth, async (req, res) => {
//     try {
//         // TODO: Implement import functionality
//         // This would typically read a CSV/Excel file and create/update policy types

//         res.status(200).json({
//             message: 'Policy type import initiated successfully'
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             message: 'Failed to import policy types',
//             error: error.message 
//         });
//     }
// });

module.exports = router;