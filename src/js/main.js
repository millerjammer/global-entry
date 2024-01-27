// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

var timer;
var counter = 0;
const monitors_max = 3;
const max_interval = 5
var total_queries = 0;
var availableLocations = [];

await queryAvailableLocations();
for(var i=0;i<monitors_max;i++)
    document.getElementById("container-main").appendChild(createQuery(i));
document.getElementById('button-query-start').addEventListener('click', onQuerySchedule);

function onQuerySchedule(){

    if(document.getElementById('query-key-1').disabled == true){
        /* Enable all monitors */
        for(var i=0;i<monitors_max;i++)
            document.getElementById('query-key-' + i).disabled = false 
        document.getElementById('button-query-start').innerText = "Monitor for Location"
        clearInterval(timer);
    }
    else{
        /* Disable all monitors */
        for(var i=0;i<monitors_max;i++)
            document.getElementById('query-key-' + i).disabled = true 
        document.getElementById('button-query-start').innerText = "Stop Monitoring"
        counter = max_interval;
        timer = setInterval(updateTimer, 1000);
    }
}

function updateTimer(){
   
    console.log("Tick: " + counter)
   if(counter++ >= max_interval){
        counter = 0;
        querySchedule();
   }
}

function createQuery(index){
/*********************************************
 *  Function to create query GUI elements    * 
 *********************************************/

    var di = document.createElement("div");
        di.id = 'query-container-' + index
        di.className = "border m-2 p-3";
        var di1 = document.createElement("label"); 
            di1.className = "form-label";
            di1.innerText = "Preferred Location";
        di.appendChild(di1);
        var con = document.createElement("div");
            con.className = "d-flex flex-row justify-content-between align-items-center"
            var di2 = document.createElement("select");
                di2.className = "form-control"
                di2.id = "query-key-" + index;
                var def = document.createElement("option");
                    def.selected = true;
                    def.innerText = "Select a Location to Monitor..."
                di2.appendChild(def);
                for(var i=0;i<availableLocations.length;i++){
                    var li = document.createElement("option");
                        li.innerText = availableLocations[i];
                    di2.appendChild(li);
                }
            con.appendChild(di2);
            var di3 = document.createElement("div");    
                di3.className = "form-check ms-4";
                var dii1 = document.createElement("input"); 
                    dii1.id = "play-sound-" + index;
                    dii1.className = "form-check-input";
                    dii1.type = "checkbox";
                di3.appendChild(dii1);
                var dii2 = document.createElement("label"); 
                    dii2.className = "form-check-label text-nowrap";
                    dii2.for = "play-sound-" + index;
                    dii2.innerText = "Play Sound";
                di3.appendChild(dii2);
            con.appendChild(di3); 
        di.appendChild(con);
        var di4 = document.createElement("p"); 
            di4.className = "text-start pt-2"
            di4.id = "query-result-location-" + index;
            di4.innerText = "Awaiting Results...";
        di.appendChild(di4);
    return di;
}

async function queryAvailableLocations(){
    var json;
    try {
        const response = await fetch('https://ttp.cbp.dhs.gov/schedulerapi/locations/?inviteOnly=false&operational=true&serviceName=Global%20Entry',  {
            method: 'GET',
            headers: {
              accept: 'application/json',
            }
        });
        json = await response.json();
    } catch (err) {
        console.log(" Fetch FAILED" + err);
        return;
    }
    availableLocations = [];
    if (Array.isArray(json)) {
        json.forEach((obj, index) => {
            console.log("Adding Location (" + index + "): " + obj.name)
            availableLocations.push(obj.name);
        }
    )};
}

async function querySchedule() {
    
    var json;
     
try {
        const response = await fetch('https://ttp.cbp.dhs.gov/schedulerapi/slots/asLocations?minimum=1&filterTimestampBy=before&timestamp=2999-02-01&serviceName=Global%20Entry',  {
            method: 'GET',
            headers: {
              accept: 'application/json',
            }
        });
        json = await response.json();
    } catch (err) {
        console.log(" Fetch FAILED" + err);
        return;
    }
    // Display the number of objects in the array
    if (Array.isArray(json)) {
        var nameData;
        console.log("Number of objects in the array: " + json.length);
        for(var i=0;i<monitors_max;i++)
            document.getElementById('query-container-' + i).classList.remove("text-bg-success")
        json.forEach((obj, index) => {
            console.log("Object: " + index + " " + obj.name)
            nameData += obj.name + '\n';
            const currentDateTime = new Date();
            const formattedDateTime = currentDateTime.toLocaleString();
            
            for(var i=0;i<monitors_max;i++){
                if(obj.name.includes(document.getElementById('query-key-' + i).value)){
                    document.getElementById('query-result-location-' + i).innerText = obj.name + ' Last Available at: ' + formattedDateTime;
                    document.getElementById('query-container-' + i).classList.add("text-bg-success")
                    if(document.getElementById('play-sound-' + i).checked){
                        document.getElementById('myAudio').play();
                    }
                }
            }
        });
        document.getElementById("last-query").value = nameData;
        document.getElementById("label-last-query").innerText = "Last Query Result: " + json.length + " Available. Total Queries: " + (++total_queries);
    } else {
        console.error('The response is not an array.');
    }
    
}
