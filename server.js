require('dotenv').config();
// dotenv 라이브러리
const express = require('express');
const app = express();
// 서버 띄우기 위한 기본세팅 완료 (express 라이브러리)
app.use(express.urlencoded({ extended: true }));
// POST 요청한 데이터 꺼내쓰기 (body-parser) -> 요청데이터 해석을 도와줌
const MongoClient = require('mongodb').MongoClient
// mongodb 연결
app.set('view engine', 'ejs')
// ejs 연결
app.use('/public', express.static('public'));
// public폴더 연결
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// html에서 put/delete 사용위한 라이브러리

let db;
MongoClient.connect(process.env.DB_URL, function(err, client) {
  if(err) return console.log(err);
  // 에러일 때
  db = client.db('todoapp'); // todoapp이라는 database(폴더)에 연결
  /*
  db.collection('post').insertOne( {이름 : 'John', _id : 20} , function(err, result) {  // 저장할 데이터는 항상 개체형식으로 저장
    console.log('저장완료');
    // 터미널에 저장완료 뜨고 몽고디비 컬렉션 가보면 데이터 저장되어 있음
    // 자료저장시 _id 꼭 적어야함 -> 안적으면 강제로 하나 부여함
  });
  */

  app.listen(process.env.PORT, function() {
    console.log('listening on 8080');
  });
  // listen(서버 띄울 포토번호, 띄운 후 실행할 코드)
  // 8080 port로 웹서버를 열고, 잘 열리면 터미널에 listening on 8080을 출력해주세요. (http://localhost:8080/)

});
// 만든 Database 접속(Connect)하기
// db접속 되면 listening on 8080을 출력

app.get('/pet', function(req, res){
  res.send('펫 용품을 쇼핑할 수 있는 페이지입니다.')
});
// 사용자가 /pet 에 방문하면, pet관련 문구 띄어주기

app.get('/', function(req, res){
  // res.sendFile(__dirname + '/index.html');
  res.render('index.ejs');
});
app.get('/write', function(req, res) {
  // res.sendFile(__dirname + '/write.html');
  res.render('write.ejs');
});
// 서버에 html파일 전송

// /list로 get요청으로 접속하면 실제 db에 저장된 데이터 보여주기
app.get('/list', function(req, res) {
  // db의 모든 데이터 꺼내기
  db.collection('post').find().toArray(function(err, result) {
    if(err) return console.log(err)
    res.render('list.ejs', { posts : result}) // ejs렌더링
    // result쓰고 싶으면 db.collection 함수 안에 있어야함
  });
});
// ! Error: Failed to lookup view "list.ejs" in views directory -> .ejs는 views 폴더에 있어야함
app.get('/search', (req, res) => {
  // console.log(req.query.value) // 서버에서 query string 꺼내기
  // Binary Search > 전제조건: 미리 숫자순 정렬이 되어있어야함 --> 미리정렬해두기 indexing --> 빠르게 찾을 수 있다.
  // "정확한 검색", -제외검색, or검색(ex) 글쓰기 이닦기)
  // 띄어쓰기 기준으로 단어를 저장함 단어의 일부를 검색하면 안나옴
  // -> 해결책1. 그냥 text index쓰지말고 검색할 문서의 양 제한두기
  // -> 해결책2. textindex 만들때 다르게 만들기
  // db.collection('post').find({ $text : { $search: req.query.value } }).toArray((err, result) => { // value제목을 가진 모든 게시물들을 db데이터에 보내줌
  // -> 해결책3. search index 사용
  let condition = [
    {
      $search : {
        index : 'titleSearch',
        text : {
          query : req.query.value,
          path : "title" // 제목 날짜 둘다 찾고 싶으면 ['title', 'date']
        }
      }
    },
    // 검색결과에서 필터주기 -> 제목o, idx, score : 검색많이 된 것
    { $project : { title : 1, _id : 0, score : { $meta : 'searchScore' }} }, 
    //{ $sort : { date : -1 }}, // 최신날짜순 정렬
    //{ $limit : 10 } // 개수 limit 주기
  ] 
  db.collection('post').aggregate(condition).toArray((err, result) => { // value제목을 가진 모든 게시물들을 db데이터에 보내줌
    console.log(result)
    res.render('search.ejs', { posts : result })
  })
});

// /detail/게시물번호 로 접속하면 detail.ejs보여줌
// findOne({찾을 요소})
app.get('/detail/:id', function(req, res) {
  // _id : req.params.id -> 파라미터 중 :id 라는 뜻
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) { 
    // if(err) return res.send('게시물 없음');
    if(result === null) return res.render('error.ejs');
    console.log(result)
    // res.render('detail.ejs', { 이런이름으로 : 이런데이터를 })
    res.render('detail.ejs', { post : result })
  })
});

// edit페이지 - list 수정
app.get('/edit/:id', function(req, res) {
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) {
    if(result === null) return res.render('error.ejs');
    res.render('edit.ejs', { post: result });
  })
});
app.put('/edit', function(req, res) {
  // 폼에담긴 제목, 날짜데이터를 가지고 db.collection에 업데이트하기
  db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { title : req.body.title, date : req.body.date}}, function(err, result) {
    console.log('수정완료');
    res.redirect('/list'); // 서버코드에선 응답필수
  });
});



// session 방식 로그인 기능 구현
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// app.use(미들웨어) : 요청-응답 중간에 뭔가 실행되는 코드
app.use(session({secret: '비밀코드', resave : true, saveUninitialized : false})); 
app.use(passport.initialize());
app.use(passport.session());

// login 페이지 라우팅
app.get('/login', (req, res) => {
  res.render('login.ejs');
})
// passport : 로그인 쉽게구현하도록 도와줌
app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail' // 로그인 실패시 /fail경로로 이동
}) ,(req, res) => {
  res.redirect('/'); // 회원정보 성공하면 홈으로 이동
});

// fail경로
app.get('/fail', (req, res) => {
  res.send('로그인실패')
})

// mypage 라우팅
app.get('/mypage', isLogin, (req, res) => {
  // console.log(req.user)
  res.render('mypage.ejs', {user : req.user});
});
// 마이페이지 접속 전 실행할 미들웨어
function isLogin(req, res, next){
  if(req.user) { // 로그인 후 세션 있으면 req.user가 항상 있음
    next()
  }else {
    // res.send('로그인 해주세요');
    res.send("<script>alert('로그인해주세요');location.href='/login';</script>");
  }
}

// 아이디 비번 인증하는 세부코드 (db와 비교)
passport.use(new LocalStrategy({
  usernameField: 'id', // name : id
  passwordField: 'pw', // name : pw
  session: true, // 로그인 후 세션을 저장할 것인지 여부
  passReqToCallback: false, // 아이디, 비번 말고도 다른 정보 검증하고 싶을 때
}, function (입력한아이디, 입력한비번, done) {
  // console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) { // db에 입력한 아이디가 있는지 찾기
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' }) // db에 아이디 없을 떄
    if (입력한비번 == 결과.pw) { // db에 아이디 있으면 pw비교 -> 암호화 안되어 있어 보안 취약함
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
  // done(서버에러, 성공시 사용자 db데이터-아이디비번 안맞으면 false, 에러메시지)
}));

// 세션을 저장시키는 코드(로그인 성공시 실행)
passport.serializeUser((user, done) => { // 아이디, 비번 검증 성공시 위의 결과 user로 보냄
  done(null, user.id) // 세션데이터를 만들고, 세션의 id정보를 쿠키로 보냄
});
// 이 세션 데이터를 가진 사람을 db에서 찾아주세요 (마이페이지 접속시 실행)
passport.deserializeUser((id, done) => {
  // db에서 위에있는 user.id로 유저찾은 뒤 유저정보 done(null, {여기})에 넣음
  db.collection('login').findOne({ id }, (err, result) => { // {id: id} -> {id}
    done(null, result) // 로그인한 유저의 세션 아이디를 바탕으로 개인정보를 db에서 찾음
    // mypage get요청에서 req.user에 저장됨
  });
})

// 유저가 가입시 입력한 id/pw db에 저장
app.post('/register', (req, res) => {
  // console.log(req.body);
  // console.log({id : req.body.id, pw : req.body.pw});
  // * 저장전에 id 중복여부 체크 / id정규식 / pw 암호화
  db.collection('login').insertOne( req.body, (err, result) => {
    res.redirect('/')
  })
});

// 사용자가 /add경로로 POST요청하면 아래 코드 실행
// input에 적은 정보는 요청(req)에 있음 -> 쉽게 꺼내쓰려면 body-parser라이브러리가 필요 (2021이후 express라이브러리에 기본포함되어있음)
app.post('/add', function(req, res) {
  res.send('전송완료');
  // req.body.요청할inputname
  // console.log(req.body.title)
  // console.log(req.body.date)

  // 게시물의 고유 id부여하기 -> db에 counter라는 collection을 추가해 따로 관리한다. (중간에 게시물이 삭제되거나 수정될 때 혼선이 올 수 있기 때문에 변하지 않는 고유 id를 부여함)
  db.collection('counter').findOne({name: '게시물 개수'}, function(err, result) { // name이 게시물개수인 데이터를 찾음
    console.log(result.totalPost);
    let cntPost = result.totalPost;

    // 숙제: 'post'라는 이름을 가진 collection에 input에 입력된 두 개의 데이터 저장하기
    let formData = {
      _id : cntPost + 1,
      title : req.body.title,
      date : req.body.date,
      writer : req.user._id // 글업로드 시 작성자 추가 (유저의 _id)
    }

    db.collection('post').insertOne( formData , function(err, result) { // db.post에 새게시물기록
      if(err) return console.log(err);
      console.log('전송완료');
      // 게시물 하나 등록될 때마다 counter라는 콜렉션의 totalPost 1증가해야함(수정) -> $inc : {key : 기존값에 더해줄값}
      db.collection('counter').updateOne({name : '게시물 개수'}, { $inc : {totalPost : 1}}, function(err, result) {
        if(err) return console.log(err);
      })
    });
  });
});

// /delete 경로로 DELETE요청 처리하는 코드
app.delete('/delete', function(req, res) {
  console.log(req.body) // 요청시 함께 보낸 데이터 찾기 (게시물 번호)
  req.body._id = parseInt(req.body._id); // '1' -> 1

  let deleteData = {
    _id : req.body._id,
    writer : req.user._id
  }
  // 실제 로그인 중인 유저의 아이디와, 글에 작성된 유저의 아이디가 일치하면 삭제

  // req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
  // deleteOne(삭제할것, function(){요청성공시})
  db.collection('post').deleteOne(deleteData, function(err, result) {
    console.log('삭제완료');
    if(err) {console.log(result)}
    // 서버는 꼭 뭔가 응답해줘야함
    res.status(200).send({ message: '삭제 성공했습니다.' });
  })
});

// 라이터 첨부
app.use('/shop', require('./routes/shop.js')) // 고객이 /shop경로로 요청했을 때 미들웨어(라우터) 적용
app.use('/board', require('./routes/board.js'))
// app.use(미들웨어)

// upload
// 이미지는 보통 하드에 저장함 (db에 저장하기에는 용량과 비용이 많이 듦)
let multer = require('multer');
let storage = multer.diskStorage({ // 이미지 하드에 저장 (memoryStorage - 렘에저장(휘발성))
  destination : (req, file, cb) => {
    cb(null, './public/image'); // 저장할 경로
  },
  filename : (req, file, cb) => {
    cb(null, file.originalname) // 저장한 이미지의 파일명 설정(기본파일명으로저장)
  },
  fileFilter : (req, file, cb) => { 
    // 파일형식 필터링
  },
  limits : {
    // fileSize : 1024 * 1024
  }
}); 
let upload = multer({ storage : storage });

// 전송한 파일 쉽게 처리 돕는 라이브러리
app.get('/upload', (req, res) => {
  res.render('upload.ejs');
});
// upload.single(input file name) -> 하나의 파일
// upload.array('input file name', n) -> n개의 파일
app.post('/upload', upload.single('uploadImg'), (req, res) => {
  res.send('업로드 완료');
});
app.get('/image/:imgName', (req, res) => {
  res.sendFile(__dirname + '/public/image/' + req.params.imgName);
})
