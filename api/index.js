const router = require('express').Router();
module.exports = router;

router.use('/authors', require('./authors'));
router.use('/books', require('./books'));
