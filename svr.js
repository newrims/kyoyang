// 필요한 모듈을 불러오기
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const static = require('serve-static');
const cors = require('cors');
const dbconfig = require('./config/dbconfig.json');

// MySQL 연결을 위한 풀을 생성
const pool = mysql.createPool({
    connectionLimit: 10,
    host: dbconfig.host,
    user: dbconfig.user,
    password: dbconfig.password,
    database: dbconfig.database,
    debug: false
})

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', static(path.join(__dirname, 'public')));

// DB에서 데이터를 검색하고 클라이언트에 응답
app.post('/callDB', (req, res) => {
    console.log('callDB 호출됨')
    
    const last_query = req.body.last_query;
    const query_GE = req.body._GE;
    const query_arr0 = req.body._query_arr0;
    const query_arr1 = req.body._query_arr1;
    const query_arr2 = req.body._query_arr2;
    const query_arr3 = req.body._query_arr3;
    const query_time = req.body._idx;

    const query_checklist = query_arr0 + query_arr1 + query_arr2 + query_arr3;

    // 쿼리 결과를 받을 resData
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

    // 최종 쿼리문
    console.log(`select * from kyoyang where not regexp_like ${query_time} and '수강제한학과' not like '%${query_GE}%' and ${query_checklist} ${last_query};`);

    // 쿼리 결과를 받아서 resData 객체에 저장하고 응답
    pool.getConnection((err, conn)=>{
        if (err) {
            conn.release();
            console.log('pool.getConnection 에러발생: ' + err.message); 
            console.dir(err);
            res.json(resData);
            return;
        }

        conn.query(`select * from kyoyang where not regexp_like ${query_time} and '수강제한학과' not like '%${query_GE}%' and ${query_checklist} ${last_query};`, (error, rows, fields)=>{
            if (error) {  // db query 실패
                conn.release();
                console.dir(error);
                res.json(resData);
                return;
            }

            conn.release();
            resData.result = 'ok';

            // DB의 내용을 resData에 저장
            rows.forEach((val)=>{
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
                resData.특이사항.push(val.crosscheck)
            })
            res.json(resData);
        })
    })
    
})

// 서버를 3000번 포트에서 실행
app.listen(3000, ()=>{
    console.log('Server started at 3000');
})
