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
let query_time;
let query_checklist = "";

app.post('/next_to_checklist', (req, res) => {
    console.log('next_to_checklist 호출됨')

    let GE = req.body.GE;

    query_GE = GE;
    console.log(query_GE);

})

app.post('/next_to_slecttime', (req, res) => {
    console.log('next_to_selecttime 호출됨');

    let query_arr0 = req.body.query_arr0;
    let query_arr1 = req.body.query_arr1;
    let query_arr2 = req.body.query_arr2;
    let query_arr3 = req.body.query_arr3;

    query_checklist = query_arr0 + query_arr1 + query_arr2 + query_arr3;
    console.log(query_checklist);
})

app.post('/next_to_test', (req, res) => {
    console.log('next_to_test 호출됨')

    const selected_time = req.body.idx;

    query_time = selected_time.reduce((acc, course, idx)=>{
        if (idx === selected_time.length - 1) {
            return acc+`${course}')`;
        }
        return acc+`${course}|`;
    },"(`시간표 - 데이터베이스용`, '");  // not regexp_like

    console.log(query_time);
    
})

app.post('/callDB', (req, res) => {
    console.log('callDB 호출됨')
    
    const resData = {}
    resData.result = 'error'
    resData.time = []
    resData.num = []
    resData.name = []

    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            console.log('pool.getConnection 에러발생');
            console.dir(err);
            res.json(resData);
            return;
        }

        conn.query(`select * from kyoyang where not regexp_like ${query_time} and '수강제한학과' not like '%${query_GE}%' and ${query_checklist} 학점 = 3;`, (error, rows, fields)=>{
            if (error) {  // db query 실패
                conn.release();
                console.dir(error);
                res.json(resData);
                return;
            }

            conn.release();
            resData.result = 'ok';

            rows.forEach((val)=>{
                // resData.num.push(val.num)
                resData.name.push(val.교과목명)
            })
            res.json(resData);
        })
    })
    
})

app.listen(3000, ()=>{
    console.log('Server started at 3000');
})
