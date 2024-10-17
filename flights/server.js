const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(express.json());

function connectWithRetry() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass@word1',
    database: 'flightsdb'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Failed to connect to MySQL. Retrying in 5 seconds...', err);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log('Connected to MySQL successfully!');
      setupRoutes(connection);
    }
  });

  connection.on('error', (err) => {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectWithRetry();
    } else {
      throw err;
    }
  });
}

function setupRoutes(db) {
  app.get('/flights', (req, res) => {
    db.query('SELECT * FROM flights', (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Error fetching flights data' });
      } else {
        res.json(results);
      }
    });
  });

 
app.post('/flights', async (req, res) => {
    const { flightId, airlineId, seats , occupied ,destination, date, departure } = req.body;
    const sql = 'INSERT INTO FLIGHTS (FLIGHTID, AIRLINEID, SEATS, OCCUPIED, PASSENGERS, DESTINATION, DEP_DATE, DEPARTURE ) VALUES (?,?,?,?,?,?,?,?)';
    const values = [flightId, airlineId, seats, occupied, JSON.stringify([]), destination, date, departure];
    try{
      console.log('4')
        const airlineRes = await axios.get(`http://localhost:3002/airlines/get/${airlineId}`);
        
        if(airlineRes.data){
          
            const url = `http://localhost:3002/airlines/update`;
           
            const data = {flight_id:flightId,id:airlineId};
            await axios.put(url,data);
          
            db.query(sql,values,(err,result)=>{
                if(err){
                    res.status(500).json({error: 'Error creating flight data',message:err.message});
                }else{
                    res.status(201).json({message : 'Flight data entered successfully',id: result.insertId});
                }
            });
        }else{
            res.status(400).json({error:'Ivalid airline id'});
        }
    }catch(error){
        res.status(500).json({error: 'Error processing flight',message:error.message});
    }
});

app.put('/flights/book',(req,res)=>{
    const {flight_id,passenger_id} = req.body;
    if(!flight_id || !passenger_id){
        return res.status(400).send('Flight ID and Passenger ID are required');
    }
    const sql = 'SELECT PASSENGERS FROM FLIGHTS WHERE FLIGHTID = ?';
    db.query(sql,[flight_id],(err,result)=>{
        if(err){
            return res.status(500).send('Error fetching flight details');
        }
        if(result.length===0){
            return res.status(404).send('Flight not found');
        }
        let passengers;
        try{
            passengers = result[0].PASSENEGERS;
        }catch(parseError){
            return res.status(500).send('Error parsing passengers')
        }
        if(!passengers.includes(passenger_id)){
            passengers.push(passenger_id);
        }else{
            return res.status(400).send('Passenger already booked a ticket for this flight');
        }
        const updateSql= 'UPDATE FLIGHTS SET PASSENGERS = ? WHERE ID = ?';
        db.query(updateSql,[JSON.stringify(passengers),flight_id],(err,result)=>{
            if(err){
                return res.status(500).send('Error updating the flight details');
            }
            res.send('Flight Booked Successfully');
        });
    });

});

app.get('/flights/passengers/:flightId',async (req,res)=>{
    try{
        const response = await axios.get(`http://localhost:3003/passengers/flight/${flightId}`);
        const passengers = response.data;
        res.status(200).json(passengers);
    }catch(err){
        res.status(500).json({message:"Error fetching passengers",error: err.message});
    }
});


app.listen(PORT, () => {
    console.log(`Flight service running on port ${PORT}`);
  });
}

connectWithRetry();