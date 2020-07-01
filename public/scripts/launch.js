function nextButton(){
    var params = new URLSearchParams(window.location.search)
    if(params.has('launch') && params.get('launch') === 'true'){
        var loc = window.location.pathname;
        var dirs = loc.split('/');
        var final = dirs[dirs.length - 1];
        var final2 = final.split('?');
        var app = final2[0];
        window.location.replace('/show/loading');
        var http = new XMLHttpRequest();
        http.open('POST','/show/' + app);
        http.send();    
    }else{
        window.location.replace('/editor');
    }
}