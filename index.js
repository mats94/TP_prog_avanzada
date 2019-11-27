var express = require('express');
var jwt = require('jsonwebtoken');
var app = express();
const port = 8080;
app.use(express.json());

app.listen(port, function () {
    console.log('App listening on port ' + port);
});

var MongoClient = require('mongodb').MongoClient;
var url = //url de la db ;

MongoClient.connect(url, function(err, db) {
    if (err){ 
      console.log(err);
      console.log("DB no se encuentra online");
    }
    else{  
      console.log("DB Online");
      db.close();
    }
  });

app.get('/veraz', function (req,res){
    jwt.verify(req.headers.jwt,'secret',function(err, decoded){
        if (err) res.status(404).send('credenciales invalidas');
        else{
            buscar(req.headers.dni,req.headers.jwt,res)
        }
      }
  )
})

app.get('/token', function(req,res){
    jwt.sign({
      }, 'secret', function(err, token){
          console.log("jwt generated: " + token)
          res.status(200).send({"token":token})
          guardar(token)
        });
})

app.get('/', function(req,res){
 res.send('Hola')
})

async function buscar(dni,jwt,res){
    await MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var dbo = client.db("Testing");
        var query = {
            "jwt": jwt
          };
          dbo.collection('registros').find(query).toArray(function(err, results) {
            if (err) {
              console.log(err);
              return err
            }
            else{
              console.log(JSON.stringify(results))  
              if(results[0] != undefined && results[0].cont < 5){                
                    sumar(jwt,results[0].cont + 1);
                    getVeraz(dni,res)
              }else{
                console.log("Limite maximo excedido")
                res.send("Limite maximo excedido")
              }   
            }
      });
      client.close();
    })
}

function sumar(jwt , suma){
    MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var dbo = client.db("Testing");
        var query = {
            "jwt": jwt
          };
        var update = {"jwt": jwt,"cont": suma}
          dbo.collection('registros').update(query,update,function(err, results) {
            if (err) {
              console.log(err);
            }
            else{
              //JSON.stringify(results);     
            }
      });
      client.close();
    })
}

function guardar(jwt){
    MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var dbo = client.db("Testing");
        var query = {
            "jwt": jwt,
            "cont": 0
          };
          dbo.collection('registros').insertOne(query,function(err, results) {
            if (err) {
              console.log(err);
            }
            else{
              console.log(results);     
            }
      });
      client.close();
    })
}

async function getVeraz(dni,res){
  await MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var dbo = client.db("Testing");
    var query = {
        "dni": dni
      };
      console.log(query)
      dbo.collection('veraz').find(query).toArray(function(err, results) {
        if (err) {
          console.log("error "+err);
          res.send(err)
        }
        else{
          console.log("resultados " + JSON.stringify(results)) 
          res.send(results)
        }
  });
  client.close();
})
}

async function pushVeraz(dni,estado,res){
  await MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var dbo = client.db("Testing");
    var file = {
        "dni": dni,
        "estado": estado
      };
      console.log(query)
      dbo.collection('veraz').insertOne(file,function(err,result){
        if (err) throw err;
        else{
          res.send("insertado correctamente")
        }
      })
  client.close();
})
}