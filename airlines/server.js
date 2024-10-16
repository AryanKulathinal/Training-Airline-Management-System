const express= require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3002;

app.use(express.json());

mongoose.connect('mongodb://0.0.0.0:27017/airlinesdb', { useNewUrlParser: true, useUnifiedTopology: true });

const Airline = mongoose.model('Airlines', {
    id :Number,
    name: String,
    rating: Number,
    country: String,
    flights : [Number]
});

app.get('/airlines',async (req,res)=>{
    try{
        const airlines = await Airline.find();
        res.json(airlines);
    }catch(error){
        res.status(500).json({error: 'Error fetching airlines'});
    }
});

app.get('/airlines/get/:id',async (req,res)=>{
    try{
        const airlineId=req.params.id;
        const airline =await Airline.findOne({airlineId});
        if(airline){
            res.json(airline);
        }else{
            res.status(404).json({error:'Airline not found'});
        }
    }catch(error){
        res.status(404).json({erorr: 'Error fetching airline'});
    }
});


app.post('/airlines', async (req, res) => {
    try {
      const airline = new Airline(req.body);
      await airline.save();
      res.status(201).json(airline);
    } catch (error) {
      res.status(500).json({ error: 'Error creating airline' });
    }
  });

app.put('/airlines/update',async (req,res)=>{
    try{
        const { flight_id, airline_id} =req.body;
        await Airline.findOneAndUpdate(
            { airlineId: airline_id },
            { $addToSet: { flights: flight_id } },);
        res.status(200).json({
            message: "Airline data updated successfully",
        });
    }catch(err){
        res.status(500).json({message: "Error updating airline data",error:err.message});
    }
   
})
  
app.listen(PORT, () => {
   console.log(`Airline service running on port ${PORT}`);
});
  


 