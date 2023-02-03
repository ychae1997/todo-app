let router = require('express').Router();

router.get('/sub/sports', (req, res) => {
  res.send('스포츠 게시판')
});
router.get('/sub/game', (req, res) => {
  res.send('게임 게시판')
});

module.exports = router;