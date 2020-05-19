var isSaveDataCheck = false;

function saveData(name, number){
    window.localStorage.setItem('user-name', name);
    window.localStorage.setItem('user-number', number);
}

function isSaveData(){
    pass = window.localStorage.getItem('user-pass');
    number = window.localStorage.getItem('user-number');
    console.log(name);
    if(pass != null && number != null) return Array(pass, number, true);
    else return Array(null, null, false);
}

function saveDataCheck(){
    if(isSaveDataCheck) isSaveDataCheck = false;
    else isSaveDataCheck = true;
}

(function($){
    var settings = {};
    var date;
    var text = '';
    var textList = [];
    var userList = [];
    var userNumberType = [];
    var query = (function(){
        var result = {};
        if( 1 < window.location.search.length )
        {
            var query = window.location.search.substring( 1 );

            var parameters = query.split( '&' );

            for( var i = 0; i < parameters.length; i++ )
            {
                var element = parameters[ i ].split( '=' );

                var paramName = decodeURIComponent( element[ 0 ] );
                var paramValue = decodeURIComponent( element[ 1 ] );

                result[ paramName ] = paramValue;
            }
        }
        return result;
    }());
    console.log(query);
    var methods = {
    init : function( options ) {
        settings = $.extend({
            'conn'  : null,
            'number': '#number',
            'pass'  : '#pass',
		    'login' : '#login',
            'join'  : '#join',
            'leave' : '#leave',
            'other' : '#other',
        }, options);
        $(settings['login']).click( methods['login'] );
        $(this).content('connect');
    },

    login : function ( event ) {
        var number = $(settings['number']).val();
        var pass = $(settings['pass']).val();
        var isError = false;
        $("[id='alert_pass']").text('');
        $("[id='alert_number']").text('');
        if(!pass){
            $("[id='alert_pass']").text('パスワードが入っていません');
            //isError = true;
        }
        if(!number){
            $("[id='alert_number']").text('社員番号が入っていません');
            isError = true;
        }
        if(isError) return;
        $('#input_area').fadeOut(1000);
        console.log($('intpu_area'));
        $('#data_area').delay(1000).fadeIn(1000);
        settings['conn'].send('{"name": "admin", "type": "user_get", "number": "'+number+'"}');
    },
    
    connect : function () {
        if (settings['conn'] == null) {
            settings['conn'] = new WebSocket('wss://www.tsukuyomi.work/wss/?login');
            settings['conn'].onopen = methods['onOpen'];
            settings['conn'].onmessage = methods['onMessage'];
            settings['conn'].onclose = methods['onClose'];
            date = $(this).content('getDateTime');
            console.log(date);
        }
    },

    onOpen : function(event) {
        $("[id='server_status']").text('正常に接続できました');
        $("[id='server_status_icon']").text('check');
        $("[id='server_status_icon']").css('color', 'green');
        var saveData = isSaveData();
        if(saveData[2] == true){
            $(this).content('setBox', saveData[0], saveData[1]);
            $('#savedata').attr('checked', '');
            isSaveDataCheck = true;
        } 
        if(Object.keys(query).length == 3){
            if(query['type'] === 'other'){
                $(this).content('setBox', query['name'], query['number']);
            }else{
                document.getElementById("input-area").setAttribute('hidden', '');
            }
        }
    },
    
    onMessage : function (event) {
        if (event && event.data) {
            $(this).content('drawText', event.data);
        }
    },

    onClose : function(event) {
        settings['conn'] = null;
        setTimeout(methods['connect'], 1000);
        $("[id='server_status']").text('接続していません');
        $("[id='server_status_icon']").text('close');
        $("[id='server_status_icon']").css('color', 'red');
    },
    
    drawText : function (message) {
        var objs = $.parseJSON(message);
        for(d in objs){
            var obj = objs[d];
            date = obj['date'];
            console.log(message);
            console.log(Encoding.detect(obj['name']));
            var encName = Encoding.convert(obj['name'], {to: 'UNICODE', from: 'AUTO', type: 'string'});
            if(obj['type'] == 'join'){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>出勤</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', 出勤\r\n';
                textList.push({number:obj['number'],　time: date , text:'['+date+']'+encName+', '+obj['number']+', 出勤'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'leave'){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>退勤</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', 退勤\r\n';
                textList.push({number:obj['number'],　time: date, text:'['+date+']'+encName+', '+obj['number']+', 退勤'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'other'){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>その他</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', その他\r\n';
                textList.push({number:obj['number'],　time: date, text:'['+date+']'+encName+', '+obj['number']+', その他'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'score'){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>テスト</td><td>'+obj['score']+'</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', テスト, '+obj['score']+'\r\n';
                textList.push({number:obj['number'],　time: date, text: '['+date+']'+encName+', '+obj['number']+', テスト, '+obj['score']});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }
        }
        console.log(text);
    },

    zeroPadding : function(num, length){
        return ('000000000000000' + num).slice(-length);
    },

    getDateTime : function(){
        var now = new Date();
        console.log(now.getMonth()+1);
        return now.getFullYear()+'-'+$(this).content('zeroPadding',now.getMonth()+1, 2)+
                '-'+$(this).content('zeroPadding',now.getDate(), 2)+' '+$(this).content('zeroPadding',now.getHours(), 2)+
                ':'+$(this).content('zeroPadding',now.getMinutes(), 2)+':'+$(this).content('zeroPadding',now.getSeconds(), 2);
    },

    setBox : function(name, number){
        $(settings['name']).val(name);
        $("[id='namel']").addClass('active');
        $(settings['number']).val(number);
        $("[id='numberl']").addClass('active');
    }    
};

$.fn.content = function( method ) {
    if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
    } else {
        $.error( 'Method ' +  method + ' does not exist' );
    }
}
})( jQuery );

$(function() {
    $(this).content({
        'send' : '#send',
        'contents' : '#contents',
        'display' : '#content'
    });
});