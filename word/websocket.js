var isSaveDataCheck = false;

function saveData(name, number){
    window.localStorage.setItem('user-name', name);
    window.localStorage.setItem('user-number', number);
}

function isSaveData(){
    name = window.localStorage.getItem('user-name');
    number = window.localStorage.getItem('user-number');
    console.log(name);
    if(name != null && number != null) return Array(name, number, true);
    else return Array(null, null, false);
}

function saveDataCheck(){
    if(isSaveDataCheck) isSaveDataCheck = false;
    else isSaveDataCheck = true;
}

(function($){
    var settings = {};
    var date;
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
            'name'  : '#name',
            'number': '#number',
		    'score' : '#score',
            'join'  : '#join',
            'leave' : '#leave',
            'other' : '#other',
        }, options);
        $(settings['join']).click( methods['join'] );
        $(settings['leave']).click( methods['leave'] );
        $(settings['other']).click( methods['other'] );
        $(this).content('connect');
    },
    
    join : function ( event ) {
        var name = $(settings['name']).val();
        var number = $(settings['number']).val();
        var isError = false;
        $("[id='alert_name']").text('');
        if(!name){
            $("[id='alert_name']").text('氏名が入っていません');
            isError = true;
        }
        if(isError) return;
        settings['conn'].send('{"name": "'+name+'", "type": "wolf"}');
    },
    
    connect : function () {
        if (settings['conn'] == null) {
            settings['conn'] = new WebSocket('ws://92.202.219.218:8081?login');
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
        var obj = $.parseJSON(message);
        console.log(obj);
        if(obj['type'] == 'join'){
            $("[id='userlist']").append('<p><label><input class="with-gap" name="group1" type="radio"/><span>'+obj["name"]+'</span></label></p>');
        }else if(obj['type'] == 'start'){
            $("[id='data']").text('あなたのお題は'+obj['job']+'です');
        }
    },

    paramGETLogin : function(obj){
        if(query['type'] === 'join'){
            if(obj['id']){
                settings['conn'].send('{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "join", "onlysend": "'+obj['id']+'", "date": "'+date+'"}');
                $('#data').text('送信データ:{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "join", "onlysend": "'+obj['id']+'", "date": "'+date+'"}');
            }else{
                settings['conn'].send('{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "join", "date": "'+date+'"}');
                $('#data').text('送信データ:{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "join", "date": "'+date+'"}');
            }
            $("[id='call']").text('GETパラメータにより出勤しました');
        }else if(query['type'] === 'leave'){
            if(obj['id']){
                settings['conn'].send('{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "leave", "onlysend": "'+obj['id']+'", "date": "'+date+'"}');
                $('#data').text('送信データ:{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "leave", "onlysend": "'+obj['id']+'", "date": "'+date+'"}');
            }else{
                settings['conn'].send('{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "leave", "date": "'+date+'"}');
                $('#data').text('送信データ:{"name": "'+query['name']+'", "number": "'+query['number']+'", "type": "leave", "date": "'+date+'"}');
            }
            $("[id='call']").text('GETパラメータにより退勤しました');
        }
    },

    zeroPadding : function(num, length){
        return ('000000000000000' + num).slice(-length);
    },

    getDateTime : function(){
        var now = new Date();
        return now.getFullYear()+'-'+$(this).content('zeroPadding',now.getMonth(), 2)+
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