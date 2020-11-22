const express = require('express');
//const readline = require('readline-sync')
const axios = require('axios')
const handlebars = require('express-handlebars')
const app = express()
const  moment = require('moment')

//Config
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

const getData = async(datetoAPI)=>{
    const datatoAPI = await axios.get(`https://epg-api.video.globo.com/programmes/1337?date=${datetoAPI}`)
    return datatoAPI.data
}


//start("2020-11-19").then((response)=>{
//    console.log(response)
//})


app.use(express.static(__dirname + '/'));

const conteudo = async(req, res, data)=>{
    const dados = await getData(data.format("YYYY-MM-DD"))
  const dateNow = moment(dados.programme.date, "YYYY-MM-DD").format("DD/MM/YYYY");
  const lastDay = moment(dados.programme.date, "YYYY-MM-DD").subtract(1, "days").format("YYYY-MM-DD");
  const tomorrow = moment(dados.programme.date, "YYYY-MM-DD").subtract(-1, "days").format("YYYY-MM-DD");
  let programation = []
  let toNow  = null
  const isToDay = moment(dateNow, "DD/MM/YYYY").format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")
   console.log(isToDay)
  for(const entry of dados.programme.entries) {
    const description = (entry.custom_info.Resumos.ResumoImprensa !== undefined) && entry.custom_info.Resumos.ResumoImprensa != "" ? entry.custom_info.Resumos.ResumoImprensa : entry.description; 
    let estaNoAr = false
    const now = moment()
    var minutesNow = now.minutes() + now.hours() * 60;
    const start = moment(entry.human_start_time, "HH:mm")
    var minutesStart = start.minutes() + start.hours() * 60;
    const end = moment(entry.human_end_time, "HH:mm")
    var minutesEnd = end.minutes() + end.hours() * 60;
    if(minutesNow < minutesEnd && minutesNow >= minutesStart && isToDay) {
        estaNoAr = true;
    }
    aux = {
        "humanStartTime": start.format("HH:mm"),
        "humanEndTime": end.format("HH:mm"),
        "tituloPrograma": entry.title,
        "descricao": description,
        "sinopse": entry.custom_info.Resumos.Sinopse,
        "idade": entry.custom_info.Classificacao.Idade,
        "sexo": entry.custom_info.Classificacao.Sexo,
        "drogas": entry.custom_info.Classificacao.Drogas,
        "violencia": entry.custom_info.Classificacao.Violencia,
        "imgPrograma": entry.custom_info.Graficos.ImagemURL,
        "logoPrograma": entry.custom_info.Graficos.LogoURL,
        "noAr": estaNoAr};           
        programation.push(aux);
       // if(estaNoAr){               
         //   toNow = aux;
        //}
  }
  
  const dadosNow = await getData(moment().format("YYYY-MM-DD"))
         for(const entry of dadosNow.programme.entries) {
            const description = (entry.custom_info.Resumos.ResumoImprensa !== undefined) && entry.custom_info.Resumos.ResumoImprensa != "" ? entry.custom_info.Resumos.ResumoImprensa : entry.description; 
            const now = moment()
            var minutesNow = now.minutes() + now.hours() * 60;
            const start = moment(entry.human_start_time, "HH:mm")
            var minutesStart = start.minutes() + start.hours() * 60;
            const end = moment(entry.human_end_time, "HH:mm")
            var minutesEnd = end.minutes() + end.hours() * 60;
            if(minutesNow < minutesEnd && minutesNow >= minutesStart) {
                toNow = {
                    "humanStartTime": start.format("HH:mm"),
                    "humanEndTime": end.format("HH:mm"),
                    "tituloPrograma": entry.title,
                    "descricao": description,
                    "sinopse": entry.custom_info.Resumos.Sinopse,
                    "idade": entry.custom_info.Classificacao.Idade,
                    "sexo": entry.custom_info.Classificacao.Sexo,
                    "drogas": entry.custom_info.Classificacao.Drogas,
                    "violencia": entry.custom_info.Classificacao.Violencia,
                    "imgPrograma": entry.custom_info.Graficos.ImagemURL,
                    "logoPrograma": entry.custom_info.Graficos.LogoURL,
                    "noAr": true};        
            }
        }
        
    res.render("home", {programation: programation, dateNow: dateNow, toNow: toNow, lastDay: lastDay, tomorrow: tomorrow});
}

app.get("/", async(req, res)=>{
  await conteudo(req, res, moment())
});

app.get('/date/:data', async(req,res)=>{
  await conteudo(req, res, moment(req.params.data, "YYYY-MM-DD"))
});

app.listen(8081, function(){
   console.log("Servidor Rodando na url http://localhost:8081");
});