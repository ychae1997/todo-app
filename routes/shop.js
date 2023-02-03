let router = require('express').Router();
// express 라이브러리의 Router()함수 사용

function isLogin(req, res, next){
  if(req.user) { // 로그인 후 세션 있으면 req.user가 항상 있음
    next()
  }else {
    res.send('로그인 해주세요');
  }
}

router.use(isLogin); // 여기 있는 모든 url에 적용할 미들웨어
//router.use('/shirts', isLogin) // 특정 url만 적용하는 미들웨어

router.get('/shirts', (req, res) => {
  res.send('셔츠 파는 페이지입니다.')
});
router.get('/pants', (req, res) => {
  res.send('바지 파는 페이지입니다.')
});
// http요청('경로', 미들웨어, 응답함수) -> 미들웨어 이용해서 로그인 했을 때만 접근 가능하게 만들기

module.exports = router;

// require('파일경로' or '라이브러리명') -> 다른 곳에서 내보낸 것 쓸때
// module.exports = router; -> 다른 곳에서 shop.js를 가져다 쓸 때 내보날 변수
