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

let db;
MongoClient.connect('mongodb+srv://admin:clwmzpdlzm0214@cluster0.nhvupcx.mongodb.net/?retryWrites=true&w=majority', function(err, client) {
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

  app.listen(8080, function() {
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
      date : req.body.date
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

// /list로 get요청으로 접속하면 실제 db에 저장된 데이터 보여주기
app.get('/list', function(req, res) {
  // db의 모든 데이터 꺼내기
  db.collection('post').find().toArray(function(err, result) {
    if(err) return console.log(err)
    console.log(result);

    res.render('list.ejs', { posts : result}) // ejs렌더링
    // result쓰고 싶으면 db.collection 함수 안에 있어야함
  });
  
});
// ! Error: Failed to lookup view "list.ejs" in views directory -> .ejs는 views 폴더에 있어야함

// /delete 경로로 DELETE요청 처리하는 코드
app.delete('/delete', function(req, res) {
  console.log(req.body) // 요청시 함께 보낸 데이터 찾기 (게시물 번호)
  req.body._id = parseInt(req.body._id); // '1' -> 1
  // req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
  // deleteOne(삭제할것, function(){요청성공시})
  db.collection('post').deleteOne(req.body, function(err, result) {
    console.log('삭제완료');
    // 서버는 꼭 뭔가 응답해줘야함
    res.status(200).send({ message: '삭제 성공했습니다.' });
  })
});

// /detail/게시물번호 로 접속하면 detail.ejs보여줌
// findOne({찾을 요소})
app.get('/detail/:id', function(req, res) {
  // _id : req.params.id -> 파라미터 중 :id 라는 뜻
  db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) { 
    if(err) return res.send('게시물 없음');
    console.log(result)
    // res.render('detail.ejs', { 이런이름으로 : 이런데이터를 })
    res.render('detail.ejs', { post : result })
  })
  
});