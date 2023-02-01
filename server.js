const express = require('express');
const app = express();
// 서버 띄우기 위한 기본세팅 완료 (express 라이브러리)
app.use(express.urlencoded({ extended: true }));
// POST 요청한 데이터 꺼내쓰기 (body-parser) -> 요청데이터 해석을 도와줌
const MongoClient = require('mongodb').MongoClient
// mongodb 연결
app.set('view engine', 'ejs')
// ejs 연결

let db;
MongoClient.connect('mongodb+srv://admin:clwmzpdlzm0214@cluster0.nhvupcx.mongodb.net/?retryWrites=true&w=majority', function(err, client) {
  if(err) return console.log(err);
  // 에러일 때

  db = client.db('todoapp'); // todoapp이라는 database(폴더)에 연결
  db.collection('post').insertOne( {이름 : 'John', _id : 20} , function(err, result) {  // 저장할 데이터는 항상 개체형식으로 저장
    console.log('저장완료');
    // 터미널에 저장완료 뜨고 몽고디비 컬렉션 가보면 데이터 저장되어 있음
    // 자료저장시 _id 꼭 적어야함 -> 안적으면 강제로 하나 부여함
  });

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
  res.sendFile(__dirname + '/index.html');
});
app.get('/write', function(req, res) {
  res.sendFile(__dirname + '/write.html');
});
// 서버에 html파일 전송

app.post('/add', function(req, res) {
  res.send('전송완료');
  // req.body.요청할inputname
  console.log(req.body.title)
  console.log(req.body.date)
  
  // 숙제: 'post'라는 이름을 가진 collection에 input에 입력된 두 개의 데이터 저장하기
  let formData = {
    title : req.body.title,
    date : req.body.date
  }

  db.collection('post').insertOne( formData , function(err, result) {
    if(err) return console.log(err);
    console.log('전송완료');
  });
  
});
// 사용자가 /add경로로 POST요청하면 위 코드 실행
// input에 적은 정보는 요청(req)에 있음 -> 쉽게 꺼내쓰려면 body-parser라이브러리가 필요 (2021이후 express라이브러리에 기본포함되어있음)

// /list로 get요청으로 접속하면 실제 db에 저장된 데이터 보여주기
app.get('/list', function(req, res) {
  res.render('list.ejs') // ejs렌더링
});
// ! Error: Failed to lookup view "list.ejs" in views directory -> .ejs는 views 폴더에 있어야함