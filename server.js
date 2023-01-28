const express = require('express');
const app = express();
// 서버 띄우기 위한 기본세팅 완료 (express 라이브러리)

app.listen(8080, function() {
  console.log('listening on 8080');
});
// listen(서버 띄울 포토번호, 띄운 후 실행할 코드)
// 8080 port로 웹서버를 열고, 잘 열리면 터미널에 listening on 8080을 출력해주세요. (http://localhost:8080/)

app.get('/pet', function(req, res){
  res.send('펫 용품을 쇼핑할 수 있는 페이지입니다.')
});
// 사용자가 /pet 에 방문하면, pet관련 문구 띄어주기

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});