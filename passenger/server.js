const express = require('express');
const mongoose = require('mongoose');

const app =express();
const PORT = 3003;

app.use(express.json());

mongoose.connect('mongodb://0.0.0.0:27017/passengerdb',{useNewUrlParser: true,useUnifiedTopology:true});
const Passenger = mongoose.model('Passenger',{
    id:Number,
    name:String,
    country: String,
});

app.get('/passengers', async (req, res) => {
    try{
        const passengers = await Passenger.find();
        res.json(passengers);
    }catch(erorr){
        res.status(500).json({error:'Error fetching user data'});
    }
});

app.get('/passengers/:id',async (req,res)=>{
    try{
        const passengerId = req.params.id;
        const passenger = await findById(passengerId);
        if (passenger){
            res.json(passenger);
        }else{
            res.status(404).json({error: 'Passenger not found'})
        }
    }catch(error){
        res.status(404).json({error:'Error fetching passenger data'});
    }
});

app.post('/passengers',async (req,res)=>{
    try{
        const passenger = new Passenger (req.body);
        await passenger.save();
        res.status(201).json(airline);
    }catch(error){
        res.status(500).json({error : 'Error creating passenger'});
    }
});

app.get('/passengers/flight/:flightId', async (req, res) => {
    try {
      const flightId = req.params.flightId;
      const passengers = await Passenger.find({ flights: flightId });
      if (passengers.length > 0) {
        res.json(passengers);
      } else {
        res.status(404).json({ error: 'No passengers found for this flight' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching passengers' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Passenger service running on port ${PORT}`);
});


