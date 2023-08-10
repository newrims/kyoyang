const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
})

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

let query_GE;
let query_times;
let query_checklist = "";

app.post('/next_to_checklist', (req, res) => {
    console.log('next_to_checklist 호출됨')

    let GE = req.body.GE;

    query_GE = GE;
    console.log(query_GE);

})
let query_arr0 = '';
let query_arr1 = '';
let query_arr2 = '';
let query_arr3 = '';

app.post('/next_to_slecttime1', (req, res) => {
    console.log('next_to_selecttime1 호출됨');

    query_arr0 = req.body.query_arr0;

    console.log(query_arr0);
})
app.post('/next_to_slecttime2', (req, res) => {
    console.log('next_to_selecttime2 호출됨');

    query_arr1 = req.body.query_arr1;

    console.log(query_arr1);
})
app.post('/next_to_slecttime3', (req, res) => {
    console.log('next_to_selecttime3 호출됨');

    query_arr2 = req.body.query_arr2;

    console.log(query_arr2);
})
app.post('/next_to_slecttime4', (req, res) => {
    console.log('next_to_selecttime4 호출됨');

    query_arr3 = req.body.query_arr3;

    query_checklist = query_arr0 + query_arr1 + query_arr2 + query_arr3;
    console.log(query_checklist);
})

app.post('/next_to_test', (req, res) => {
    console.log('next_to_test 호출됨')

    query_times = req.body.query_time;

    console.log(query_times);
})

app.post('/callDB', (req, res) => {
    console.log('callDB 호출됨')
    
    const last_query = req.body.last_query;

    const resData = {}
    resData.result = 'error'
    resData.이름 = []
    resData.교수 = []
    resData.시간 = []
    resData.이수구분 = []
    resData.발표 = []
    resData.시험 = []
    resData.출석 = []
    resData.레포트 = []
    resData.토론 = []
    resData.조별 = []
    resData.실습 = []
    resData.평가 = []
    resData.퀴즈 = []
    resData.특이사항 = []
    resData.학점 = []

    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            console.log('pool.getConnection 에러발생'); 
            console.dir(err);
            res.json(resData);
            return;
        }

        conn.query(`select * from kyoyang where not regexp_like ${query_times} and '수강제한학과' not like '%${query_GE}%' and ${query_checklist} ${last_query};`, (error, rows, fields)=>{
            if (error) {  // db query 실패
                conn.release();
                console.dir(error);
                res.json(resData);
                return;
            }

            conn.release();
            resData.result = 'ok';

            rows.forEach((val)=>{
                // resData.name.push(val.교과목명)
                resData.이름.push(val.교과목명)
                resData.교수.push(val.교수명)
                resData.시간.push(val.시간표)
                resData.이수구분.push(val.이수구분)
                resData.발표.push(val.발표)
                resData.시험.push(val.시험)
                resData.출석.push(val.출석)
                resData.레포트.push(val.레포트)
                resData.토론.push(val.토론)
                resData.조별.push(val.조별)
                resData.실습.push(val.실습)
                resData.평가.push(val.평가방법)
                resData.퀴즈.push(val.퀴즈)
                resData.학점.push(val.학점)
                // resData.특이사항.push()
            })
            res.json(resData);
        })
    })
    
})

app.listen(3000, ()=>{
    console.log('Server started at 3000');
})
