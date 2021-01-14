'use strict';

const firebase = require('../db');
const Slots = require('../models/slots');
const availability = require('./availability');
const firestore = firebase.firestore();

function parseTime(s) {
    var c = s.split(':');
    return parseInt(c[0]) * 60 + parseInt(c[1]);
}

function convertHours(mins){
    var hour = Math.floor(mins/60);
    var mins = mins%60;
    var converted = pad(hour, 2)+':'+pad(mins, 2);
    return converted;
}

function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}


function addTimes(t0, t1) {
    return secsToTime(timeToSecs(t0) + timeToSecs(t1));
}
  
// Convert time in H[:mm[:ss]] format to seconds
function timeToSecs(time) {
    let [h, m, s] = time.split(':');
    return h*3600 + (m|0)*60 + (s|0)*1;
}
  
// Convert seconds to time in H:mm:ss format
function secsToTime(seconds) {
    let z = n => (n<10? '0' : '') + n; 
    return (seconds / 3600 | 0) + ':' +
            z((seconds % 3600) / 60 | 0)
}


// function to calculate timeslots between two give times
function calculate_time_slot(start_time, end_time, interval = "30"){
    var i, formatted_time;
    var time_slots = new Array();
        for(var i=start_time; i<=end_time; i = i+interval){
        formatted_time = convertHours(i);
        time_slots.push(formatted_time);
    }
    return time_slots;
}

// function to convert timezone
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

const addSlot = async (req, res, next) => {
    try {
        const data = req.body;
        let startTime = availability.startTime;
        let endTime = availability.endTime; 
        let duration = availability.duration;
        let timeZone = availability.timeZone;
        var start_time = parseTime(startTime);
        var end_time = parseTime(endTime);
        let eventTime = data.eventTime;
        let eventDuration = data.eventDuration;
        let tempEventDuration = eventDuration;
        const convertedDate = convertTZ(eventTime , timeZone); 
        let eventHours = convertedDate.getHours()
        let eventMinutes = convertedDate.getMinutes();
        let dateString = convertedDate.toISOString().split('T')[0];
        if (eventMinutes == 0) {
            eventMinutes = eventMinutes+"0"
        }
        let eventString = eventHours+":"+eventMinutes;
        if (eventString < startTime || eventString > endTime) {
            return res.send({"status" : 403, "message" : "User is not avaiable during the given time"});
        }
        let tempTime = eventString;
        let newSlots = [tempTime]
        // fetch all the possible slots for the user wrt start and endtime
        var availableSlots = calculate_time_slot( start_time, end_time, duration ); 
        console.log(availableSlots);
        // fetch all the booked slots
        var existingData = await firestore.collection('slots').where('date', '==', dateString).get();
        let existingSlots = []
        existingData.forEach(doc => {
            existingSlots.push(doc.data())
        });
        let slotsBooked = []
        existingSlots.map(function(eachSlot){
            slotsBooked = slotsBooked.concat(eachSlot.slotsBooked)
            return slotsBooked
        }) 
        while (eventDuration > duration) {
            tempTime = addTimes('0:'+ duration, tempTime);
            newSlots.push(tempTime)
            eventDuration = duration-eventDuration
        }
        let difference = availableSlots.filter(x =>  !slotsBooked.includes(x));
        let intersection = newSlots.filter(x =>  !difference.includes(x));
        if (intersection.length > 0) {
            return res.send({"status" : 422, message :  "The choosen timeslots are not available "});
        }
        let payload = {
            "date" : dateString,
            "timeStamp" : eventTime,
            "duration" : tempEventDuration,
            "slotsBooked" : newSlots
        }
        console.log(payload);
        await firestore.collection('slots').doc().set(payload);
        return res.send({"status" : 200,  "message" : "Successfully blocked the calendar"});
    } catch (error) {
        return res.status(400).send(error.message);
    }
}

const getSlots = async (req, res, next) => {
    try {
        let startDate = req.query.startDate; 
        let endDate = req.query.endDate; 
        const data = await firestore.collection('slots').where('date', '>=', startDate).where('date', '<=', endDate).get();
        const slotsArray = [];
        if(data.empty) {
            res.status(404).send({"status" : 404, "data" : "Data not found"});
        }else {
            data.forEach(doc => {
                const slot = new Slots(
                    doc.id,
                    doc.data().date,
                    doc.data().timeStamp,
                    doc.data().duration,
                    doc.data().slotsBooked
                );
                slotsArray.push(slot);
            });
            return res.status(200).send({"status" : 200,  "data" : slotsArray});
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({"status" : 500, "data" : "Internal server error"});
    }
}

const getAvailableSlots = async (req, res, next) => {
    try {
        console.log(req.query);
        let startTime = availability.startTime;
        let endTime = availability.endTime; 
        let duration = availability.duration;
        let timeZone = req.query.timeZone;
        let start_time = parseTime(startTime);
        let end_time = parseTime(endTime);
        let dateString = req.query.date
        let availableSlots = calculate_time_slot( start_time, end_time, duration ); 
        let existingData = await firestore.collection('slots').where('date', '==', dateString).get();
        let existingSlots = []
        existingData.forEach(doc => {
            existingSlots.push(doc.data())
        });
        let slotsBooked = []
        existingSlots.map(function(eachSlot){
            slotsBooked = slotsBooked.concat(eachSlot.slotsBooked)
            return slotsBooked
        }) 
        let difference = availableSlots.filter(x =>  !slotsBooked.includes(x));
        difference = difference.map(function(eachSlot) {
            var tempDate = "";
            let hr = parseInt(eachSlot.split(":")[0])
            let min = parseInt(eachSlot.split(":")[1])
            tempDate = new Date(dateString);
            tempDate.setHours(hr);
            tempDate.setMinutes(min);
            tempDate.setSeconds(0);
            const convertedDate = convertTZ(tempDate , timeZone); 
            return convertedDate;
        })
        res.status(200).send({"status" : 200, "data" : difference});
    } catch (error) {
        console.log(error)
        res.status(400).send({"status" : 500, "data" : "Internal server error"});
    }
}


module.exports = {
    addSlot,
    getSlots,
    getAvailableSlots
}