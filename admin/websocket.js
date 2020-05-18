$(document).ready(function(){
    $('select').formSelect();
});

var unique;
var isAcceptJoin = true;
var isAcceptLeave = true;
var isAcceptOther = true;
var isAcceptScore = true;

document.addEventListener('DOMContentLoaded', function() {
    unique = window.localStorage.getItem('unique-setting');
    if (unique != null) {
        switch (unique) {
            case "1": document.getElementById("unique").setAttribute('checked', '');
                break;
            case "2": document.getElementById("itemunique").setAttribute('checked', '');
                break;
            case "3": document.getElementById("notunique").setAttribute('checked', '');
                break;
            default:
                break;
        }
    }else{
        unique = "1";
        document.getElementById("unique").setAttribute('checked', '');
    }
    console.log(document.getElementById("scoreaccept").getAttribute("checked"));
    tmp = window.localStorage.getItem('isAcceptJoin');
    if(tmp === 'true' && tmp != null) {
        isAcceptJoin = true;
        document.getElementById("joinaccept").setAttribute('checked', '');
    }else if(tmp != null) isAcceptJoin = false;
    else document.getElementById("joinaccept").setAttribute('checked', '');

    tmp = window.localStorage.getItem('isAcceptLeave');
    if(tmp === 'true' && tmp != null) {
        isAcceptLeave = true;
        document.getElementById("leaveaccept").setAttribute('checked', '');
    }else if(tmp != null) isAcceptLeave = false;
    else document.getElementById("leaveaccept").setAttribute('checked', '');

    tmp = window.localStorage.getItem('isAcceptOther');
    if(tmp === 'true' && tmp != null) {
        isAcceptOther = true;
        document.getElementById("otheraccept").setAttribute('checked', '');
    }else if(tmp != null) isAcceptOther = false;
    else document.getElementById("otheraccept").setAttribute('checked', '');

    tmp = window.localStorage.getItem('isAcceptScore');
    if(tmp === 'true' && tmp != null) {
        isAcceptScore = true;
        document.getElementById("scoreaccept").setAttribute('checked', '');
    }else if(tmp != null) isAcceptScore = false;
    else document.getElementById("scoreaccept").setAttribute('checked', '');
});


$(function() {
    $('#unique').click(function(){
        window.localStorage.setItem('unique-setting', "1");
        unique = "1";
    });
    $('#itemunique').click(function(){
        window.localStorage.setItem('unique-setting', "2");
        unique = "2";
    });
    $('#notunique').click(function(){
        window.localStorage.setItem('unique-setting', "3");
        unique = "3";
    });
    $('#joinaccept').click(function(){
        if(isAcceptJoin){
            window.localStorage.setItem('isAcceptJoin', "false");
            isAcceptJoin = false;
        }else{
            window.localStorage.setItem('isAcceptJoin', "true");
            isAcceptJoin = true;
        }
    });
    $('#leaveaccept').click(function(){
        if(isAcceptLeave){
            window.localStorage.setItem('isAcceptLeave', "false");
            isAcceptLeave = false;
        }else{
            window.localStorage.setItem('isAcceptLeave', "true");
            isAcceptLeave = true;
        }
    });
    $('#otheraccept').click(function(){
        if(isAcceptOther){
            window.localStorage.setItem('isAcceptOther', "false");
            isAcceptOther = false;
        }else{
            window.localStorage.setItem('isAcceptOther', "true");
            isAcceptOther = true;
        }
    });
    $('#scoreaccept').click(function(){
        if(isAcceptScore){
            window.localStorage.setItem('isAcceptScore', "false");
            isAcceptScore = false;
        }else{
            window.localStorage.setItem('isAcceptScore', "true");
            isAcceptScore = true;
        }
    });
});

function isAccept(type, number, userNumber, userNumberType){
    console.log(userNumberType);
    switch (unique) {
        case "1":   if(userNumber.indexOf(number) == -1 && ((type==="join" && isAcceptJoin) || (type==="leave" && isAcceptLeave) || (type==="other" && isAcceptOther) || (type==="score" && isAcceptScore))) return true;
                    else return false;
        case "2":   if(userNumberType.indexOf(number+type) == -1 && ((type==="join" && isAcceptJoin) || (type==="leave" && isAcceptLeave) || (type==="other" && isAcceptOther) || (type==="score" && isAcceptScore))) return true;
                    else return false;
        case "3":   return  ((type==="join" && isAcceptJoin) || (type==="leave" && isAcceptLeave) || (type==="other" && isAcceptOther) || (type==="score" && isAcceptScore));
        default:
            break;
    }
}

(function($){
    var settings = {};
    var text = '';
    var textList = [];
    var userList = [];
    var userNumberType = [];
    var isScoreOnly = false;
    var isTimeUser = true;
    var isNotUniqueNumber = false;
    var sortItemList = {'時間': 1, '社員番号': 2};
    var sortOrderList = {'昇順': 1, '降順': 2};
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
            'text'  : '#text',
            'reset' : '#reset',
            'sort' : '#sort',
            'download': '#download', 
            'usertime': '#usertime',
            'admintime':'#admintime',
            'scoreonly':'#scoreonly',
            'uniquesetting':'#uniquesetting',
            'uniquenumber':'#uniquenumber',
            'getdata' : '#getdata',
        }, options);
        $(settings['reset']).click(methods['reset']);
        $(settings['sort']).click(methods['sort']);
        $(settings['usertime']).click(methods['times']);
        $(settings['admintime']).click(methods['times']);
        $(settings['scoreonly']).click(methods['scoreonly']);
        $(settings['uniquesetting']).click(methods['uniquesetting']);
        $(settings['getdata']).click(methods['getdata']);
        $(this).content('connect');
    },
    
    connect : function () {
        if (settings['conn'] == null) {
            settings['conn'] = new WebSocket('ws://www.tsukuyomi.work:8081?admin');
            settings['conn'].onmessage = methods['onMessage'];
            settings['conn'].onclose = methods['onClose'];
        }
    },

    reset : function (){
        $("[id='text']").text('');
        text = '';
        textList.splice(0);
        userList.splice(0);
        userNumberType.splice(0);
    },

    sort : function (){
        var newArray = []
        var linkTag = document.getElementById('download');
        var sortItem = sortItemList[$('#sortitem > .select-wrapper > .dropdown-content > .selected').text()];
        var sortOrder = sortOrderList[$('#sortorder > .select-wrapper > .dropdown-content > .selected').text()];
        console.log(sortItem);
        console.log(sortOrder);
        $("[id='text']").text('');
        text = ''
        textList.sort(function(a, b){
            if(sortItem == 1){
                if(a.time > b.time) return ((sortOrder == 1) ? 1 : -1);
                else return (sortOrder == 1 ? -1 : 1);
            }else{
                if(a.number > b.number) return ((sortOrder == 1) ? 1 : -1);
                else return ((sortOrder == 1) ? -1 : 1);
            }
        });
        for(l in textList){
            var tmp = textList[l].text.replace(/\s*,\s*/g, '</td><td>');
            tmp = tmp.replace(/\]/g, '</td><td>');
            tmp = tmp.replace(/\[/g, '<tr><td>')+'</td></tr>';
            console.log(tmp);
            $("[id='text']").append(tmp);
            newArray.push(textList[l].text);
        }
        text = newArray.join('\r\n');
        var blob = new Blob([text], {type:"text/plan"});
        linkTag.setAttribute('href', URL.createObjectURL(blob));
        linkTag.setAttribute('download', 'call.txt');
        console.log(text);
    },

    getdata : function(event){
        var minute = $('#minute').val();
        var isError = false;
        $("[id='alert_minute']").text('');
        console.log(minute);
        if(!minute){
            $("[id='alert_minute']").text('社員番号が入っていません');
            isError = true;
        }
        if(isError) return;
        settings['conn'].send('{"name": "admin", "type": "admin_all_get", "minute": "'+minute+'"}');
    },

    onMessage : function (event) {
        if (event && event.data) {
            $(this).content('drawText',event.data);
        }
    },

    onClose : function(event) {
        settings['conn'] = null;
        setTimeout(methods['connect'], 1000);
    },
    
    drawText : function (message) {
        var objs = $.parseJSON(message);
        var linkTag = document.getElementById('download');
        var date;
        for(d in objs){
            var obj = objs[d];
            if(obj['date']){
                date = obj['date'];
            }else{
                var now = new Date();
                var date = now.getFullYear()+'/'+$(this).content('zeroPadding',now.getMonth(), 2)+
                            '/'+$(this).content('zeroPadding',now.getDate(), 2)+' '+$(this).content('zeroPadding',now.getHours(), 2)+
                            ':'+$(this).content('zeroPadding',now.getMinutes(), 2)+':'+$(this).content('zeroPadding',now.getSeconds(), 2);
            }
            console.log(message);
            console.log(Encoding.detect(obj['name']));
            var encName = Encoding.convert(obj['name'], {to: 'UNICODE', from: 'AUTO', type: 'string'});
            if(obj['type'] == 'join' && isAccept(obj['type'], obj['number'], userList, userNumberType)){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>出勤</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', 出勤\r\n';
                textList.push({number:obj['number'],　time: date , text:'['+date+']'+encName+', '+obj['number']+', 出勤'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'leave' && isAccept(obj['type'], obj['number'], userList, userNumberType)){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>退勤</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', 退勤\r\n';
                textList.push({number:obj['number'],　time: date, text:'['+date+']'+encName+', '+obj['number']+', 退勤'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'other' && isAccept(obj['type'], obj['number'], userList, userNumberType)){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>その他</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', その他\r\n';
                textList.push({number:obj['number'],　time: date, text:'['+date+']'+encName+', '+obj['number']+', その他'});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }else if(obj['type'] == 'score' && isAccept(obj['type'], obj['number'], userList, userNumberType)){
                $("[id='text']").append('<tr><td>'+date+'</td><td>'+encName+'</td><td>'+obj['number']+'</td><td>テスト</td><td>'+obj['score']+'</td></tr>');
                text += '['+date+']'+encName+', '+obj['number']+', テスト, '+obj['score']+'\r\n';
                textList.push({number:obj['number'],　time: date, text: '['+date+']'+encName+', '+obj['number']+', テスト, '+obj['score']});
                userList.push(obj['number']);
                userNumberType.push(obj['number']+obj['type']);
            }
        }
        var blob = new Blob([text], {type:"text/plan"});
        console.log(text);
        linkTag.setAttribute('href', URL.createObjectURL(blob));
        linkTag.setAttribute('download', 'call.txt');
    },

    zeroPadding : function(num, length){
        return ('000000000000000' + num).slice(-length);
    },
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