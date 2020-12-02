const getUserURL = 'http://localhost:3000/login/';
const getSendMessURL = 'http://localhost:3000/sendMessage/';
const getTalksURL ='http://localhost:3000/talks/';
const getTalkMessURL = 'http://localhost:3000/talkMessages/';
const postContactosURL = 'http://localhost:3000/contactos/';
const userHTML = document.querySelector('#user');
const passwordHTML = document.querySelector('#password');
const keyHTML = document.querySelector('#key');
const nombreHTML = document.querySelector('#nombre');
const emailHTML = document.querySelector('#email');
const fromHTML = document.querySelector('#from');
const toHTML = document.querySelector('#to');
const messageHTML = document.querySelector('#message');
//const enviarHTML = document.querySelector('#enviar');
//var img = document.querySelector('#gatos');


function borrar(){
    userHTML.value = '';
    passwordHTML.value = '';
    keyHTML.value = '';
    nombreHTML.value ='';
    emailHTML.value = '';
    fromHTML.value = '';
    toHTML.value = '';
    messageHTML.value = '';
}
async function getUser () {
    var resp = await fetch(getUsernURL);
    var obj = await obj(
            userHTML.innerText = obj.user,
            passwordHTML.innerText = obj.password,
            keyHTML.innerText = obj.key,
            );

}
async function getSendMessURL(){
    var resp = await fetch(getSendMessURL);


}
   
}
async function enviar(){
   
    var usuario = {
        user:userHTML.value,
        password:passwordHTML.value,
        key:keyHTML.value,
    },
    var email = {
       nombre:nombreHTML.value,
       email:emailHTML.value,
    },
    var mensaje = {
        para:fromHTML.value,
        de:toHTML.value,
        mensaje:messageHTML.value,
    };


    };
    fetch(addRefranURL,requestOptions)
        .then(res=>{
            window.alert('Gracias por participar;p');
            borrar();
        })
        .catch(res=>window.alert('¡¡La cagaste!!'))
    
}

enviarHTML.onclick = enviar;

getRefran();