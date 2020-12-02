const express =  require('express');
const app = express();

const multer = require('multer');
const mimeParse = multer();

const MongoClient = require('mongodb').MongoClient;

const mongoURL = 'mongodb://localhost:27017/whatson';

const apiPort = 3000

var messagesCollection, usersCollection;

async function conectToMongoDB(mongoURL) {
	//Esta función es únicamente necesaria para poder emplear await para la gestión de las promesas.
	var clienteMongo = await MongoClient.connect(mongoURL,{useUnifiedTopology: true});
	messagesCollection = await clienteMongo.db().collection('messages');
	usersCollection = await clienteMongo.db().collection('users');
	console.log('*** Conectado a MongoDB');
}

conectToMongoDB(mongoURL);

app.get('/login/', async (req,res)=>{
	/**
	* Endpoint: http://localhost:3000/login/?user=AAAA&password=BBBB
	*/
	var user = req.query.user;
	var password = req.query.password;
	var userDoc = await usersCollection.findOne({userName: user});
	if ( ! userDoc) {
		//Si el usuario no existe lo creamos y entregamos la llave
		var apiKey = Math.random().toString(16) //Generamos una llave 'aleatoria'. 
		userDoc = {
			userName: user,
			password: password,
			key: apiKey,
			talks: []
		}
		usersCollection.insertOne(userDoc);
		console.log('* Creado usuario:',userDoc);
		res.send(apiKey);
	} else if (userDoc.password === password) {
		//Si el usuario existe y la clave enviada coincide entregamos la llave
		console.log('* Inicia sesión:',user);
		res.send(userDoc.key);
	} else {
		//Si el usuario existe pero la clave no coincide
		console.log('* Inicio de sesión incorrecto:',user,req.ip);
		res.send('Invalid password');
	}
})

app.get('/sendMessage/', async (req,res)=>{
	/**
	 * Endpoint: http://localhost:3000/sendMessage/?apiKey=AAAAA&message=BBBBBBBB&to=CCCCCCCC
	 */
	var apiKey = req.query.apiKey;
	var message = req.query.message;
	var destUserName = req.query.to;
	var toUser = await usersCollection.findOne({userName: destUserName});
	var fromUser = await usersCollection.findOne({key: apiKey});
	if ( !toUser || !fromUser) {
		//Si no existe el usuario de destino o la llave de la API.
		console.log('* Error sending message:',apiKey,destUserName);
		res.send('* Error: bad key or user name.');
	} else {
		//De otro modo, añadimos el mensaje a la colección.
		//Si no hay registrada una conversación anterior con el destinatario, se registra.
		var messageDocument = {
			from: fromUser.userName,
			to: destUserName,
			text: message,
			time: Date.now()
		};
		messagesCollection.insertOne(messageDocument)
		if ( ! fromUser.talks.includes(destUserName)) {
			fromUser.talks.push(destUserName);
			usersCollection.replaceOne({_id: fromUser._id},fromUser);
		}
		if ( ! toUser.talks.includes(destUserName)) {
			toUser.talks.push(destUserName);
			usersCollection.replaceOne({_id: toUser._id},toUser);
		}
		console.log('* Mensaje:',fromUser.userName,toUser.userName);
		res.send('Ok!');	
	}
})

app.get('/talks/', async (req,res)=>{
	/**
	* Endpoint: http://localhost:3000/talks/?apiKey=AAAAAAA
	*/
	var apiKey = req.query.apiKey;
	var userDoc = await usersCollection.findOne({key: apiKey});
	if (userDoc) {
		var json = JSON.stringify(userDoc.talks)
		console.log('* Peticion de lista de conversaciones:',apiKey, json);
		res.send(json);
	} else {
		console.log('* Error: bad API key getting talks',apiKey,req.ip);
		res.send('Bad api key');
	}
})

app.get('/talkMessages/', async (req,res)=>{
	/**
	* Endpoint: http://localhost:3000/talkMessages/?key=AAAAAAA&talk=BBBBBBB
	*/
	var talk = req.query.talk;
	var apiKey = req.query.apiKey;
	var userDoc = await usersCollection.findOne({key: apiKey});
	if (userDoc) {
		//Filtro para obtener los mensajes de la conversacion.
		//Emplea el remitente y destinatario de los mensajes.
		//El nombre de la conversacion corresponde con el del interlocutor.
		var findFilter = {
		  $or:[
		    {from:userDoc.userName,to:talk},
		    {from:talk,to:userDoc.userName}
		  ]
		};
		//Ordenamos los mensajes por el timestamp para recibirlas en el orden cronológico.
		var findOptions = {
		  sort: ['time']
		};
		var messages = await messagesCollection.find(findFilter,findOptions).toArray();
		var json = JSON.stringify(messages)
		console.log('* Petición de mensajes',apiKey,talk);
		res.send(json);
		
	} else {
		console.log('* Error: bad API key getting messages',apiKey,talk,req.ip);
		res.send('Bad api key');
	}
})
app.Post('/contacto/', mimeParse.none(),async(req, res)=>{
	var nombre = req.body.nombre;
	var email = req.body.email;
	var nuevoContacto = await usersCollection.find({nombre},{email});
	if(!nuevoContacto){
		console.log('No existe este contacto',nuevoContacto);
		res.send('No se encontro');
	} else{
		usersCollection.insertOne(nombre);
		usersCollection.insertOne(email);
		console.log('Creado nuevo contacto',nombre, email);
		res.send(nuevoContacto);
	}
	//console.log(req.method, req.url, req.ip);

})

app.listen(apiPort,()=>{
	console.log(`*** Express escuchando desde ya en http://localhost:${apiPort}/`);
})