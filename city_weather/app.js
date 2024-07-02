const express = require("express")
const app = express();
const path = require("path");
const requests = require("requests");
const fs = require("fs");

let static_path = path.join(__dirname , "./public");

// MIDDLEWARES
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.set("view engine" , "hbs");

const replacement = function(htmlfile , data){ 
    if(data){
        let original_Data = htmlfile.replace("{{KANPUR}}" , data.name);
        original_Data = original_Data.replace("{{WEATHER}}" , data.weather[0].main);
        let temp_status = data.weather[0].main;
        original_Data = original_Data.replace("%STATUS%" , temp_status);
        let temp = Math.round(data.main.temp - 273); 
        original_Data = original_Data.replace("{{TEMPERATURE}}" , temp);
        original_Data = original_Data.replace("{{WIND}}" , `${data.wind.speed}m/sec`);
        return original_Data;
    }else{   
        return;
    }
};

// ROUTES
app.get("/" , (req,res)=>{
  res.render("home");
});

app.get("/search" , (req,res)=>{
    res.render("home");
});
 
app.post("/search" , async(req,res)=>{
    try{
        let city = req.body.cityname;   
        console.log(city); 
        console.log(req.url);  
        await requests(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=801b69500727775a5d7853c3d4c28983`).on("data" , function(chunk){ 
            const fileData = JSON.parse(chunk);
            // HTML FILE
            const html = fs.readFileSync("./views/home.hbs" , "utf-8"); 
            // console.log(html); 
            // console.log(fileData.weather[0].main);
            // let weather = fileData.weather[0].main;
            // let city = fileData.name;
            // console.log(city,weather);
            let city_data = replacement(html,fileData);
            res.send(city_data);
            console.log(fileData); 
        });
    }catch(err){
      res.send("not found"); 
    }
}); 

// SERVER   
app.listen(5500 , "127.0.0.1" , ()=>{
    console.log("Listening to port 5500."); 
});    