const express = require('express');
const router = express.Router();
const auth = require('./authRoutes').auth; // Import JWT auth middleware
const insuranceController = require('../controllers/insuranceController');
const policyTypeController = require('../controllers/policyTypeController');

// Insurance policy routes
// router.route('/')
//     .get(auth, insuranceController.getAllClients) // Get all insurance policies
//     .post(auth, insuranceController.createClient); // Create new insurance policy

// router.route('/:id')
//     .get(auth, insuranceController.getClientById) // Get policy by ID
//     .put(auth, insuranceController.updateClient) // Update policy
//     .delete(auth, insuranceController.deleteClient); // Cancel policy

// Policy type routes
// router.route('/types')
//     .get(auth, policyTypeController.getAllPolicyTypes) // Get all policy types
//     .post(auth, policyTypeController.createPolicyType); // Create new policy type

// router.route('/types/:id')
//     .get(auth, policyTypeController.getPolicyTypeById) // Get policy type by ID
//     .put(auth, policyTypeController.updatePolicyType) // Update policy type
//     .delete(auth, policyTypeController.deletePolicyType); // Delete policy type

// Policy type by name route
// router.get('/types/name/:name', auth, policyTypeController.getPolicyTypeByName);

// Policy search routes
// router.route('/search')
//     .get(auth, insuranceController.getClientsByPolicies); // Search policies by filters

// Policy renewal routes
// router.route('/:id/renew')
//     .post(auth, async (req, res) => {
//         try {
//             const { id } = req.params;
//             const { renewalDate, premiumAmount } = req.body;

//             // Get existing policy
//             const policy = await insuranceController.getClientById(req, res);
//             if (!policy) {
//                 return res.status(404).json({ message: 'Policy not found' });
//             }

//             // Update policy with renewal details
//             const updatedPolicy = await insuranceController.updateClient(req, res);
//             if (!updatedPolicy) {
//                 return res.status(400).json({ message: 'Failed to renew policy' });
//             }

//             res.json({
//                 message: 'Policy renewed successfully',
//                 policy: updatedPolicy
//             });
//         } catch (error) {
//             res.status(500).json({ message: error.message });
//         }
//     });

// Policy status update route
// router.route('/:id/status')
//     .put(auth, async (req, res) => {
//         try {
//             const { id } = req.params;
//             const { newStatus } = req.body;

//             // Validate status
//             const validStatuses = ['active', 'expired', 'cancelled', 'pending'];
//             if (!validStatuses.includes(newStatus)) {
//                 return res.status(400).json({ message: 'Invalid status' });
//             }

//             // Update policy status
//             const updatedPolicy = await insuranceController.updateClient(req, res);
//             if (!updatedPolicy) {
//                 return res.status(400).json({ message: 'Failed to update status' });
//             }

//             res.json({
//                 message: 'Policy status updated successfully',
//                 policy: updatedPolicy
//             });
//         } catch (error) {
//             res.status(500).json({ message: error.message });
//         }
//     });

module.exports = router;