const express = require('express');
const {addSlot, 
        getSlots,
        getAvailableSlots
      } = require('../controllers/slotsController');

const router = express.Router();

router.post('/slot', addSlot);
router.get('/slots', getSlots);
router.get('/availableSlots', getAvailableSlots);


module.exports = {
    routes: router
}