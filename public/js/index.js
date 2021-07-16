var nickname = document.getElementById('nickname');
var content = document.getElementById('content');
var isPrivate = document.getElementById('isPrivate');
var send = document.getElementById('send_enable');
var message = document.getElementById('message_zone');

send.addEventListener('click', function (e) {
    e.preventDefault(); // 阻擋後端執行

    /* 使按鈕失效 */
    send.disabled = true;
    send.setAttribute('id', 'send_disable');
    send.setAttribute('value', '傳送中...');

    /* 無效的comment */
    if (nickname.value == '' || content.value == '') {
        /* 無效訊息顯示 */
        message.innerHTML = '<div class="block" id="msg_warning" style="display: none">上面兩個輸入格為必填欄位</div>';
        $('#msg_warning').fadeIn(500);
        send.disabled = false;
        send.setAttribute('id', 'send_enable');
        send.setAttribute('value', '送出');
        setTimeout(() => $('#msg_warning').fadeOut(500), 5000);
        return;
    }

    /* 整理要POST的資料 */
    var now = new Date();
    var timeList = [];
    timeList.push(now.getFullYear().toString());
    timeList.push(now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1).toString());
    timeList.push(now.getDate() < 10 ? '0' + now.getDate() : (now.getDate()).toString());
    timeList.push(now.getHours() < 10 ? '0' + now.getHours() : (now.getHours()).toString());
    timeList.push(now.getMinutes() < 10 ? '0' + now.getMinutes() : (now.getMinutes()).toString());
    timeList.push(now.getSeconds() < 10 ? '0' + now.getSeconds() : (now.getSeconds()).toString());

    var newComment = {
        'nickname': nickname.value,
        'content': content.value,
        'isPrivate': isPrivate.checked,
        'time': timeList,
        'unixTime': now.getTime()
    }; // data

    try {
        axios.post('/submitted', newComment).then((res) => {
            var public = document.getElementById('public_comments');
            var writeToWeb = '';
        
            for (var i = 0, j = res.data.length; i < res.data.length; i++, j--) {
                writeToWeb += '<div class="block">\n';
                if (j < 10) {
                    writeToWeb += '<div class="no">0' + j + '</div>\n';
                } else {
                    writeToWeb += '<div class="no">' + j + '</div>\n';
                }
                writeToWeb += '<div class="author">' + res.data[i].nickname + '</div>\n';
                writeToWeb += '<div class="line"></div>\n';
                writeToWeb += '<div class="content">' + res.data[i].content + '</div>\n';
                writeToWeb += '<div class="date">' + res.data[i].time[0] + '/' + res.data[i].time[1] + '/' + res.data[i].time[2] + ' ';
                writeToWeb += res.data[i].time[3] + ':' + res.data[i].time[4] + ':' + res.data[i].time[5] + '</div>\n';
                writeToWeb += '</div>\n';
            }
            public.innerHTML = writeToWeb;

            /* 清空表單資料 */
            var username = nickname.value  // 清除之前把nickname存起來
            nickname.value = '';
            content.value = '';
            isPrivate.checked = false;

            /* 成功訊息顯示 */
            message.innerHTML = '<div class="block" id="msg_success" style="display: none">成功傳送"' + username + '"的留言！</div>';
            $('#msg_success').fadeIn(500);
            send.disabled = false;
            send.setAttribute('id', 'send_enable');
            send.setAttribute('value', '送出');
            setTimeout(() => $('#msg_success').fadeOut(500), 5000);
            
        });
    } catch (e) {
        /* 無效訊息顯示 */
        message.innerHTML = '<div class="block" id="msg_error" style="display: none">內部伺服器錯誤，紫紅要去抓蟲了...</div>';
        $('#msg_error').fadeIn(500);
        send.disabled = false;
        send.setAttribute('id', 'send_enable');
        send.setAttribute('value', '送出');
        setTimeout(() => $('#msg_error').fadeOut(500), 5000);
        console.log(e);
    }
});