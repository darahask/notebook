function nextButton(){
    if(window.location.href.includes('libreoffice')){
        window.location = '/show/loading';
        xhttp.open("POST", "/show/libreoffice", true);
        xhttp.send()
    }
    window.location = '/editor';
}