// express
const express = require('express');
const app = express();

// mongodb
const MongoClient = require('mongodb').MongoClient;

// EJS
app.set('view engine','ejs');

//body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// 데이터베이스 접근
let dbUrl = 'mongodb+srv://admin:qwer1234@cluster0.3uwxb.mongodb.net/todoapp?retryWrites=true&w=majority';
let todoApp;

MongoClient.connect(dbUrl, 
  (error, client) => {
    if (error) return console.log('데이터베이스 오류');

    todoApp = client.db('todoapp');

    app.listen(8080, () => {
      console.log('8080 포트 오픈');
    });
  }
);


// get부분------------------------------------------------------------------
app.get('/write', (req, res) => {
  res.render('write.ejs')
});

// delete부분------------------------------------------------------------------
app.delete('/delete', (req, res) => {
  req.body._id=parseInt(req.body._id);
  todoApp.collection('todolist').deleteOne({_id:req.body._id},(error,result)=>{
    if(error) return console.log('게시물 삭제 실패');
    console.log(typeof req.body._id);
    res.status(200);
  })
});

// update부분------------------------------------------------------------------
app.get('/update/:id', (req, res) => {
  todoApp.collection('todolist').findOne({_id:Number(req.params.id)},(error,result)=>{
    res.render('update.ejs',{결과:result});
  });
});

// $set은 필드의 값을 설정
app.put('/put',(req,res)=>{
  todoApp.collection('todolist').updateOne(
    {_id:Number(req.body.id)},
    {$set:{title:req.body.title,order:Number(req.body.order)}},
    (error,result)=>{
      if(error) return console.log('업데이트 실패');
      res.redirect('/');
    })
  res.status(200);
})


// post부분------------------------------------------------------------------
app.post('/add', (req, res) => {
  let appTitle = req.body.title;
  let appOrder = parseInt(req.body.order);
  
  //발행자료 갯수
  todoApp.collection('postcount').findOne({게시물갯수:'게시물갯수'},(error,result)=>{
    if(error) return console.log('게시물 갯수 검색 실패');
    let totalCount = result.전체갯수;

     // todoapp에 자료저장
    todoApp.collection('todolist').insertOne({title:appTitle,order:appOrder,_id:totalCount+1},(error,result)=>{
      if(error) return console.log('/add 오류');
      console.log('/add 성공');
      // updateOne(조건,변경값,콜백)
      todoApp.collection('postcount').updateOne({게시물갯수:'게시물갯수'},{$inc:{전체갯수:1}},(error,result)=>{
        if(error) return console.log('/add 문서갯수 변경 오류');
        res.redirect('/');
      });
    });
  });
});


// EJS부분------------------------------------------------------------------
// /로 접근하는 앱에게 db자료를 찾아서 index.ejs에게 제공
// todoapp의 자료를 가져와서 보여줌
app.get('/',(req,res)=>{
  todoApp.collection('todolist').find().toArray((error,result)=>{
    if(error) return console.log('자료검색 오류');
    res.render('index.ejs',{todoData:result});
  });
});