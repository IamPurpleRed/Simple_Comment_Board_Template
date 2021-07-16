var express = require('express');
var favicon = require('serve-favicon');
require('dotenv').config();

var app = express();
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ejs */
app.set('views', './views');
app.set('view engine', 'ejs');

/* firebase admin SDK */
var admin = require('firebase-admin');
var serviceAccount = require(process.env.serviceAccount);  // private key store in the root folder
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.firebaseURL
});
var fbData = admin.database();

/* routers */
app.get('/', (req, res) => {
    var appProperties, comments = [], sum = 0;  // 準備要給client的東西

    fbData.ref('appProperties').once('value', (snapshot) => {
        appProperties = snapshot.val();  // 取得appProperties資料後
    }).then(() => {
        fbData.ref('comments/public').orderByChild('unixTime').once('value', (snapshot) => {
            snapshot.forEach((item) => {
                comments.push(item.val());  // 再一個個取得public comment，push到comments陣列內
                sum++;
            });

            comments.reverse();  // comments陣列的順序是unixTime小到大，反轉陣列變成大到小
            var allData = {
                'appProperties': appProperties,
                'comments': comments,
                'sum': sum
            };  // 整理成json格式
            res.render('index', allData);  // 最後導向頁面
        });
    });
});

/* 當使用者POST */
app.post('/submitted', (req, res) => {
    /* 表單資訊 */
    var nickname = req.body.nickname;
    var content = req.body.content;
    var isPrivate = req.body.isPrivate;
    var time = req.body.time;
    var unixTime = req.body.unixTime;

    /* 根據isPrivate決定存放位置 */
    if (isPrivate) {
        var commentRef = fbData.ref(process.env.privatePosition).push();
        updateTask();
    } else {
        var commentRef = fbData.ref(process.env.publicPosition).push();
        updateTask();
    }

    function updateTask() {
        commentRef.set({ 'nickname': nickname, 'content': content, 'isPrivate': isPrivate, 'time': time, 'unixTime': unixTime }).then(() => {
            fbData.ref(process.env.publicPosition).orderByChild('unixTime').once('value', (snapshot) => {
                var comments = [];
                snapshot.forEach((item) => {
                    comments.push(item.val());
                });
                comments.reverse();
                res.send(comments);
            });
        });
    }
});

/* port listening */
var port = process.env.PORT || 3000;
app.listen(port);
