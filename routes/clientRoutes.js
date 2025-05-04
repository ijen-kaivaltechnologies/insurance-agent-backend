const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Import JWT auth middleware
const clientController = require("../controllers/clientController");
const { validate, clientValidationRules } = require("../middleware/validator");
const upload = require("../utils/fileUpload");

// Client routes
router
  .route("/")
  .get(
    auth,
    clientValidationRules.search,
    validate,
    clientController.getAllClients
  ) // Get all clients
  .post(
    auth,
    upload.fields([
      { name: 'adhar_card', maxCount: 1 },
      { name: 'pan_card', maxCount: 1 },
      { name: 'driving_licence', maxCount: 1 },
      { name: 'mediclaim', maxCount: 1 },
      { name: 'rc_book', maxCount: 1 },
      { name: 'other_file', maxCount: 1 }
    ]),
    clientValidationRules.create,
    validate,
    clientController.createClient
  ); // Create new client

router
  .route("/:id")
  .get(
    auth,
    clientValidationRules.getOne,
    validate,
    clientController.getClientById
  ) // Get client by ID
  .put(
    auth,
    clientValidationRules.update,
    validate,
    clientController.updateClient
  ) // Update client
  .delete(
    auth,
    clientValidationRules.delete,
    validate,
    clientController.deleteClient
  ); // Delete client

// Import clients from CSV
router.post('/import-csv',
  auth,
  upload.single('csv'),
  clientController.importClientsFromCsv
);

module.exports = router;
