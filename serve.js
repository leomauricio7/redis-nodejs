const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/teste', { useNewUrlParser: true })
const statusDB = mongoose.connection;

statusDB.on('error', console.error.bind(console, 'connection error:'));
statusDB.once('open', function() {
  console.log('Conectado ao mongoDB com sucesso!');
})


const dbFind = (id) => {
    return new Promise( (resolve, reject) => {
        setTimeout( () => resolve(id), Math.random()*2000 )
    })
}

const redis = require('redis');
const redisClient = redis.createClient();

const getcache = (key) => {
    return new Promise( (resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if(err){
                reject(err)
            }else{
                resolve(value)
            }
        })
    })
}

const setCache = (key, value) => {
    return new Promise( (resolve, reject) => {
        redisClient.set(key, value, 'EX', 10, (err) => {
            if(err){
                reject(err)
            }else{
                resolve(true)
            }
        })
    })
}

app.get('/', (req, res) => {
    res.send('From cache');
})

app.get('/user/:id', async (req, res) => {
    const id = req.params.id;
    const value = await getcache(`get${id}`)
    if(value){
        res.send(`From cache: ${JSON.stringify(value)}`)
    }else{
        const idValue = await dbFind(req.params.id)
        await setCache(`get${id}`, idValue)
        res.send(`From BD: ${idValue}`)
    }
})

app.listen(port, () => { console.log(`Rodando na porta ${port}`)})
