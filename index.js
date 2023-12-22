// global variables-
var rep = 1;
var sessions = 0;
var tgSession = 0;
var Work  =  25;
var ShortBreak = 5;
var LongBreak = 15;
var TimerOn = false ;
var currentMode = "Pomodoro";
var pgWidth = 0;
const date = new Date();
const RestNotification = {title : "Pomozoro", body : "Time for a break!"};
const WorkNotification = {title : "Pomozoro", body : "Time to Focus!"};

// theme colors -------
var themeclrs = ["#DFA878", "#CD5C08", "#FFBB5C", "#618264", "#75C2F6", "#58287F", "#394867"]
var currentTheme ;


// Audio ------------
var clickaudio = new Audio("sounds/mouse-click.mp3");
var Alaramaudio = new Audio("sounds/alaram-clock.mp3");


// Elements ------------------
var modeName = document.getElementById("modeInfo");
var minCount = document.getElementById("minutes");
var secCount = document.getElementById("seconds");
var StartPause = document.getElementById("startpausebtn");
var progress = document.getElementById("progress");
var settingbtn = document.getElementById("setting");
var settingModal = document.getElementById("settingModal");
var modalclosebtn = document.getElementById("modalclose");
var sessionCountbar = document.getElementById("sessionCount"); 
var sessionInfo = document.getElementById("sessionInfotxt");
var skipbtn = document.getElementById("skipbtn");

var round = document.getElementById("round");
var dots = document.getElementsByClassName("dots");
var whitedots = 0;
var sets = 0;

//  functions to be executed onload----------------------------------------

//if Set => custom setting stored in localstorage  


if(localStorage.getItem("timerSetting"))
{
    const Timerstng =   JSON.parse(localStorage.getItem("timerSetting"));
    Work = Timerstng.pomodoro;
    ShortBreak = Timerstng.shortbreak;
    LongBreak = Timerstng.longbreak;
    tgSession = Timerstng.targetSession;

    setUi();
    updateTimerUi(Work*60);
    setTargetCount(tgSession);
    // Setround(tgSession);
  
}

// Sets Today's date in localstorage if not already -------------------------

if(!localStorage.getItem("Date")){      

    localStorage.setItem("Date", date.getTime());
}

var d = new Date(parseInt(localStorage.getItem("Date")));

if(!isToday(d))        // if today's date do not match with Stored date
{                                       // reset variable;
    localStorage.setItem("sessions", 0);
    localStorage.setItem("sets", 0);
    localStorage.removeItem("Date"); 
    location.reload(); // reload to set new date in localstorage
}




// ---------------------------------------------------------------------

// Event listeners for Startpause btn
var clickcount = 0;

StartPause.addEventListener("click", StartAndPause ) ;     

window.addEventListener("keypress", (e)=>{      
    
    if(e.code == "Space")
    {
        // if task input is not active 
        if(document.getElementById("task") !== document.activeElement ){
            e.preventDefault();  // prevent spacebar scroll 
            StartAndPause(); 
        }
    }
} )



//  Main functions ---------------------------------------------

function StartAndPause()
{ 
    clickaudio.play(); 

    clickcount++;
    if (clickcount % 2 == 0){       // when timer is paused
        StartPause.textContent = "START";
        StartPause.classList.remove("btnPressed");
        TimerOn = false;   // global timer on-off variable 
        skipbtn.style.display = "none"; // hide skip button
    }
    else{   
        StartPause.textContent = "PAUSE";       //  when timer in ON
        StartPause.classList.add("btnPressed");
        TimerOn = true;
        skipbtn.style.display = "block"; // show skip button
    }

    if (clickcount == 1){          // activates the timer after 1st click 
        StartTimer(rep);
    }
}

var clockTicker;

function Timer(time, progwidth){         //recursive func. Responsible for clock ticking 

    var min = Math.floor(time/60) ;
    var second = time % 60 ;
    document.title = min + ":" + second;

    // skip button--------------------------
    skipbtn.addEventListener("click", ()=>{
        time = 1;
    });
    

    if (time > 0){          // if timer not finished =>  call again 

        clockTicker = setTimeout(()=>{
            if(TimerOn){    // global Timeron variable
                --time;
                IncreaseProgress(progwidth);        // updates the ui of progress bar
            }
            else{
                time = time - 0;
            }
            Timer(time, progwidth);

        }, 1000)

    }
    else{   // if the timer is over
        Alaramaudio.play(); // play notification audio
        if(rep % 2 ==0){
            sendNotification(WorkNotification);         // Push notifications -------
        }
        else{
            sendNotification(RestNotification);
        }
        
        setTimeout(()=>{
            progress.style.width = 0 + "%"; // reset progress bar
            rep++;  
            // if(rep == 1) Resetround();
            pgWidth = 0;
            StartTimer(rep);     //calls the Starttimer function when current mode is over
        }, 2000)

    }

    updateTimerUi(time);
}



function StartTimer(rep){          // chooses a timer and starts it -> by calling Timer func.

    var count

    if (rep % 8 == 0 ){
        currentMode = "Long Break";
        modeName.textContent = currentMode;
        Setround()
        IncrementSessions();    // to update session count bar after session completion
        rep = 0;                // reset rep after long break

        count = LongBreak * 60;
        Timer(count, count)
    }

    else if (rep % 2 == 0){
        currentMode = "Short Break"
        modeName.textContent = currentMode;
        Setround();
        count = ShortBreak * 60;
        Timer(count, count)
        IncrementSessions();    
    }
    else{
        currentMode = "Pomodoro";
        modeName.textContent = currentMode;
        // Setround();
        count = Work*60;
        Timer(count, count);
    }

}

function TimerOver()
{
    Alaramaudio.play(); // play notification audio
    if(rep % 2 ==0){
        sendNotification(WorkNotification);         // Push notifications -------
    }
    else{
        sendNotification(RestNotification);
    }
    
    setTimeout(()=>{
        progress.style.width = 0 + "%"; // reset progress bar
        rep++;  
        pgWidth = 0;
        StartTimer(rep);     //calls the Starttimer function when current mode is over
    }, 2000)  
}




// helper functions ----------------------------------------------------------------------

function updateTimerUi(time){
    
    var min = Math.floor(time/60) ;
    var second = time % 60 ;


    if (min < 10){
        minCount.textContent =  "0" + min;             //  updates in timer ui 
        document.title = "0"+ min + ":0"+ second + " - " + currentMode;
    }
    else{
        minCount.textContent =  min;  
    }

    if (second < 10 ){
        secCount.textContent =  ":0"+second; 
        document.title = "0"+min +":0"+second + " - " + currentMode;
    }
    else{
        secCount.textContent =  ":"+ second;
    }


}


function setUi(){            // updates the Session count bar onload time

    if(localStorage.getItem("sessions"))
    {           
        sessions = localStorage.getItem("sessions");
        sessionCountbar.textContent = "#"+sessions; 
    }
    if(localStorage.getItem("sets") > 0)
    {           
        sets = localStorage.getItem("sets");
        console.log(sets)
        document.getElementById("setsCompleted").textContent = "+"+ sets;
    }
    // Set theme -----------------------
    if(localStorage.getItem("theme"))
    {   
        // get from localstorage
        currentTheme = localStorage.getItem("theme");
        // set
        document.body.style.backgroundColor = currentTheme; 
        StartPause.style.color = currentTheme
        document.getElementById("currentColor").style.backgroundColor = currentTheme;

    } 
}

function setTargetCount(tgSession)
{
    if(tgSession > 0 ){       // set target session
        var targetcount = document.getElementById("targetCount");
        targetcount.textContent = "/" + tgSession;
        targetcount.style.display = "block";

        Appendround(tgSession)

    }
}


function IncrementSessions(){
    sessions++;     // also add to sessions after Work 
    sessionCountbar.textContent = "#"+sessions; // updates the count bar 
    localStorage.setItem("sessions", sessions);     // updates in localstorage
}


function IncreaseProgress(totalwidth)
{
    pgWidth++; 
    progress.style.width =  (pgWidth/totalwidth) * 100 + "%";
}   

function Appendround(dotstoAdd = 4) // Adds dots under timer
{ 
        for(var i = 0; i < dotstoAdd-4; i++) 
        {   
            if (dotstoAdd == 0) break ;
            var dot = document.createElement("span");
            dot.className += "dots";
            round.appendChild(dot)

        }
}

function Setround()  // updates white dots 
{   
    whitedots++;
    if(whitedots > dots.length)
    {
        Resetround();
    }
    for(var i = 0; i<whitedots; i++)
    {
        dots[i].style.backgroundColor = "white";
    }

    localStorage.setItem("whitedots", whitedots);
}

function Resetround()
{   
    whitedots = 1;
    for(var i=0; i<dots.length; i++){
        dots[i].style.backgroundColor = "rgba(255, 255, 255, .1)";
    }

    sets++;
    document.getElementById("setsCompleted").textContent = "+"+ sets;
    localStorage.setItem("sets", sets);
}


function isToday(date)  // returns true if input date matches with today's date;
{
	const today = new Date();
    // console.log(today);

    return  date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear();
}


// Push Notifications ---------------------------------------------

function sendNotification(notification){

    Notification.requestPermission().then(permission => {
    
    var notify = new Notification(notification.title, {body : notification.body});
        
    setTimeout(()=>{notify.close()}, 2000);

    })
}



// Todo list code----------------------------------------------------------

var addtaskbtn = document.getElementById("addtask");
var todoInput = document.getElementById("task");
var listcontainer = document.getElementById("listContainer");

showTasks();  // shows list of tasks if any 


addtaskbtn.addEventListener("click", ()=>{  // add task button
    
    if(todoInput.value == ""){
        alert("You must write something!")
    }
    else{
        addTask();
        showTasks();
    }

})
// when clicked on the task => check off 
listcontainer.addEventListener("click", (e)=>{ 
    if(e.target.tagName === "LI"){
        e.target.classList.toggle("taskCompleted");
        SaveTask();
    }else if(e.target.tagName === "SPAN"){
        e.target.parentElement.remove();
        SaveTask();
        showTasks();
    }
});

function addTask()
{
    var task = document.createElement("li");
    var dltTask = document.createElement("span");

    task.textContent = todoInput.value;
    todoInput.value = "";
    dltTask.textContent = "x";


    task.appendChild(dltTask);
    listcontainer.appendChild(task);
    SaveTask();

}


function SaveTask()     // saves innerhtml in storage
{
    localStorage.setItem("Tasks", listcontainer.innerHTML);
}

function showTasks(){
    var savedData = localStorage.getItem("Tasks");

    if(savedData){
        listcontainer.innerHTML = savedData;
    }

    if(listcontainer.children.length == 0)
    {
        listcontainer.style.display = "none";
    }
    else{
        listcontainer.style.display = "block";
    }
    
}




// Setting Modal functions -------------------------------------------------------------------------

settingbtn.onclick = () => {  // Open settings button 
    
    settingbtn.classList.add("OpenSetting")
    settingModal.style.display = "block";
}

// modal close btn------------------

modalclosebtn.onclick = ()=>{
    settingModal.style.display = "none";
    settingbtn.classList.remove("OpenSetting")
}


// save and update settings on Ok button  ---------------------------

document.getElementById("settingOK").onclick = () => {

    SaveSettings() ;    

    location.reload(); // reload to update 
}


// Set theme color ---------------------------------------------------------

var setTheme = document.getElementById("currentColor");
var clrpickerModal = document.getElementById("clrpicker");
const allColors = document.getElementsByClassName("clr");       // all color elements list



Array.from(allColors).forEach( (color, index)=>{

    color.addEventListener("click", ()=>{

    currentTheme = themeclrs[index];    // update current theme
    color.children[0].classList.add("checked"); // add check mark to current

    document.body.style.backgroundColor = currentTheme; // Set current theme color
    StartPause.style.color = currentTheme;
    clrpickerModal.style.display = "none";
    settingModal.style.display = "block";
    setTheme.style.backgroundColor = currentTheme;
    
    localStorage.setItem("theme", currentTheme);

    })

})

// Open theme picker modal ---------------------------
setTheme.onclick = ()=>{

    // Set a check mark on the current theme color
    for(var i=0; i < themeclrs.length; i++){
        if (themeclrs[i] == currentTheme){
            allColors[i].children[0].classList.add("checked");
        }
        else{
            allColors[i].children[0].classList.remove("checked");
        }
    }
    
    settingModal.style.display = "none";
    clrpickerModal.style.display = "block";
}


// closing modals on window click -------------------

window.onclick = (event)=>{

    if(event.target == settingModal){
        settingModal.style.display = "none";
        settingbtn.classList.remove("OpenSetting")
    }
    if(event.target == clrpickerModal){
        clrpickerModal.style.display = "none";
        settingModal.style.display = "block";

    }  
}




// set custom minutes --
var pomo = document.getElementById("Setpomo");
var shbreak = document.getElementById("Setshbreak");
var lgbreak = document.getElementById("Setlgbreak");
var target = document.getElementById("targetSession");

// set value of all inputs in setting
pomo.value = Work;
shbreak.value = ShortBreak;
lgbreak.value = LongBreak;
target.value = tgSession;

function SaveSettings(){        // function to execute upon setting update;

    const timerStng = {
        pomodoro : pomo.value,
        shortbreak : shbreak.value,
        longbreak : lgbreak.value,
        targetSession : target.value, 
    }

    localStorage.setItem("timerSetting", JSON.stringify(timerStng));

}


