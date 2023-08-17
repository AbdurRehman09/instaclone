const express=require('express')
const app=express()
const mongoose=require('mongoose')
const PORT=process.env.port || 5000
const{MONGOURI}=require('./config/key')

require('./models/user')
require('./models/post')

app.use(express.json())

app.use((require('./routes/auth')));
app.use((require('./routes/post')));
app.use((require('./routes/user')));
mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true

})
mongoose.connection.on('connected',()=>{
    console.log('connected to db');
})
mongoose.connection.on('error',(err)=>{
    console.log('connecting to error',err)
})
// next is imp here as if we dont use it it will hang browser because of middleware
// const customMiddleware=(req,res,next)=>{
//    console.log("middleware executed!!!!")
//    next()
// }
// app.use(customMiddleware)
// app.get('/',(req,res)=>{
//     console.log("home");
//     res.send('Hello world');
// })

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}
app.listen(PORT,()=>{
    console.log("Server is running on ",PORT);
})

