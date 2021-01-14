# Appointments  <br />
Book a calender based on availability  <br /> <br />


#Setup and instructions  <br />
1) Open terminal and run npm install to  installing dependencies <br />
2) create .evn file and add the  below firestore configuration <br />
    #express server config <br /><br />

    PORT=8080 <br />
    HOST=localhost <br />
    HOST_URL=hhttp://localhost:8080 <br /><br />


    #firebase db config <br />
    API_KEY= <br />
    AUTH_DOMAIN= <br />
    DATABASE_URL= <br />
    PROJECT_ID= <br />
    STORAGE_BUCKET= <br />
    MESSAGING_SENDER_ID= <br />
    APP_ID= <br /><br />

3) Configure available timings in Controllers/availability.js <br />
4) Run npm start <br /><br />

#API Details <br />
  1) Create Appointment <br />
  Endpoint : http://localhost:8080/api/slot <br />
  Method : POST <br />
  Payload : { "eventTime": "2021-01-14T10:30:00.844Z", "eventDuration": 45 } <br />
  Sample Response :  <br />
  {
    "status": 200,
    "message": "Successfully blocked the calendar"
  } <br /> <br />

2) List appointment between two date  <br />
  Sample endpoint : http://localhost:8080/api/slots?startDate=2021-01-10&endDate=2021-01-15 <br />
  Method : GET <br />
  Sample Response :  <br />
  {
    "status": 200,
    "data": [
        {
            "id": "yLdMBwb5y0brLgE3Yycq",
            "timestamp": "2021-01-14",
            "date": "2021-01-14T08:00:00.844Z",
            "slotsBooked": 45,
            "duration": [
                "13:30",
                "14:00"
            ]
        }
    ]
  } <br /> <br />

3) List available slots for a given date <br />
  Sample endpoint : http://localhost:8080/api/availableSlots?date=2021-01-14&timeZone=Asia/Calcutta <br />
  Method : GET <br />
  Sample Response :  <br />
  {
    "status": 200,
    "data": [
        "2021-01-14T02:30:00.000Z",
        "2021-01-14T03:00:00.000Z",
        "2021-01-14T03:30:00.000Z",
        "2021-01-14T04:00:00.000Z",
        "2021-01-14T04:30:00.000Z",
        "2021-01-14T05:00:00.000Z",
        "2021-01-14T05:30:00.000Z",
        "2021-01-14T06:00:00.000Z",
        "2021-01-14T06:30:00.000Z",
        "2021-01-14T07:00:00.000Z",
        "2021-01-14T07:30:00.000Z",
        "2021-01-14T09:00:00.000Z",
        "2021-01-14T09:30:00.000Z",
        "2021-01-14T10:00:00.000Z",
        "2021-01-14T10:30:00.000Z",
        "2021-01-14T11:00:00.000Z",
        "2021-01-14T11:30:00.000Z"
    ]
  }
