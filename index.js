require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const position = require("./model/Position");
const order = require("./model/Orders");


const app = express();

app.use(express.json());

async function connectDB () {
    mongoose.connect(process.env.DATABASE_URL || DATABASE_URL).then(() => {
        console.log("conectado com o banco")
    });
}

connectDB();

app.use('/comprar', async (req, res, next) => {
    let positionTrading = await position.findOne({_id:'65c41b9de10fb55d559dd5ef'});
    if(positionTrading.comprado == true) {
        console.log("Estamos comprados aguardando venda")
    }else {
        const order = newOrder("0.18", "BUY")
        let inPositionBuy = await position.findOneAndUpdate({_id:'65c41b9de10fb55d559dd5ef'}, {comprado: true})
        let inPositionSell = await position.findOneAndUpdate({_id:'65c41b9de10fb55d559dd5ef'}, {vendido: false})
    }
});

app.use('/vender', async (req, res, next) => {
    let positionTrading = await position.findOne({_id:'65c41b9de10fb55d559dd5ef'});

    if(positionTrading.vendido == false) {
        const order = newOrder("0.18", "SELL");
        let inPosition = await position.findOneAndUpdate({_id:'65c41b9de10fb55d559dd5ef'}, {comprado: false})
        let inPositionSell = await position.findOneAndUpdate({_id:'65c41b9de10fb55d559dd5ef'}, {vendido: true})
   
    }else {
        console.log("aguardando compra");
    }
   
   
}); 

app.use('/', (req, res, next) => {
    console.log("Hello world");
    
});

const axios = require('axios')
const crypto = require('crypto')

async function newOrder (quantity, side) {

    const data = {
     symbol: process.env.SYMBOL || SYMBOL,
     type: 'MARKET',
     side,
     quantity
    };
 
    const timestamp = Date.now();
    const recvWindow = 60000;
 
    const signature = crypto
      .createHmac('sha256', process.env.SECRET_KEY || SECRET_KEY)
      .update(`${new URLSearchParams({...data, timestamp, recvWindow})}`)
      .digest('hex');
     
     const newData = {...data, timestamp, recvWindow, signature} 
     const qs = `?${new URLSearchParams(newData)}`;
 
     try {
         const result = await axios({
             method: 'POST',
             url: `${process.env.API_URL}/v3/order${qs}`,
             headers: {'X-MBX-APIKEY': process.env.API_KEY || API_KEY}
         });
 
        // console.log(result.data.symbol);

         let orderStruture = {
            orderId: result.data.orderId,
            symbol: result.data.symbol,
            quantity: result.data.origQty,
            side: result.data.side,
            price: result.data.fills[0].price
         }
         
         let newOrder = new order(orderStruture);

         await newOrder.save();
         
         console.log(orderStruture);
 
     } catch (error) {
         console.log(error)
     }
 }
 
app.listen(process.env.PORT || PORT, () => {
    console.log("Start server at" + process.env.PORT || PORT)
});