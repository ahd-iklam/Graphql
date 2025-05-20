const urlAutotification = "https://learn.zone01oujda.ma/api/auth/signin";
const urlGraph = "https://learn.zone01oujda.ma//api/graphql-engine/v1/graphql";

const userInfoAndProgress = document.createElement("div")
userInfoAndProgress.className = "userInfoAndProgress"

let infoUser;
let allTransactInfo;// transction infos

const credentials = {
    username: '',
    password: ''
};
document.addEventListener("DOMContentLoaded",getTalentCreds );

function getTalentCreds() {
    // Check if the user is already logged in by checking the token in localStorage
    const storedToken = localStorage.getItem("talentToken");
    if (storedToken) {
        // If token exists, fetch user data immediately
        talentToken = storedToken;
        fetchUserData();
    } else {
        // If no token, prompt user to log in
        document.getElementById("submitButton").addEventListener("click", function () {
            const passwordDIV = document.getElementById("password");
            const usernameDIV = document.getElementById("username");
            credentials.password = passwordDIV.value;
            credentials.username = usernameDIV.value;
            fetchTalentToken();
        });
    }
}




let talentToken;

//funtion to get JWT 
function fetchTalentToken(){
    let login = async function () {
        const headers = new Headers();
        //Basic sert pour envoyer en message des données en base64 
        headers.append('Authorization', 'Basic ' + btoa(credentials.username + ':' + credentials.password));
        try {
          const response = await fetch(urlAutotification, {
            method: 'POST',
            headers: headers
          });
          const token = await response.json();
          if (response.ok) {
            console.log("ok" ,response)
            talentToken = token;
              localStorage.setItem("talentToken", talentToken); 
            fetchUserData();
          } else {
            afficherError()
          }
        } catch (error) {
          console.error('Error:', error);
        }
    };
    login();
}

let timeout;
function afficherError(){
    clearTimeout(timeout);
    const error = document.getElementById("errorMessage");
    error.textContent="Error bad password or username"
    timeout = setTimeout(()=>{
        error.textContent=""
    },2000);
}

// fetch user data and get it
async function fetchUserData() {

    fetch(urlGraph, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${talentToken}`
        },
        body: JSON.stringify({
            query: `
        query {
            user {
                id
                login
                attrs
                totalUp
                totalDown
                transactions ( where: {eventId: {_eq: 41}}, order_by: {createdAt:asc}){
                amount
                type
                createdAt
                }
            }
            transaction{
                id
                type
                amount 	
                objectId 	
                userId 	
                createdAt 	
                path
            }
        }`
        })
    })
    .then(response => response.json())
    .then(data => {

        // console.log("data fetched from api" , data)
        // console.log(data, "dattttttttttttttttttttttttttttttttttttttttaaaaaaaaaaaaaaaaaaa"); 
        infoUser = data.data.user[0];
        // console.log("user data", infoUser)
        allTransactInfo = data.data.transaction;
        createProfilPageUser();
    })
    .catch(error => {
        console.error('error something bad happened whithin fetching data:', error);
    });
}

//create profile page when the user loggin 
async function createProfilPageUser(){
    if (infoUser){
        const contentPage = document.getElementById("personalnfo");
        document.getElementById("allContent").style.display= "none";
        await welcomeMessage()

        TalentPersonalInfos(contentPage)
        createRadarChart(transactSkill());
        auditRatio() 
        generateGraphLinear();
        generateGraphBar(); 
        console.log(transactSkill())

    }
}

async function welcomeMessage() {
    const WelcomeMessageDiv =  document.createElement("div")

    WelcomeMessageDiv.className = "WelcomeMessageDiv"
    const TalantName = infoUser.attrs.firstName;
    const welcomeMessage = document.getElementById("titrePage");
    welcomeMessage.textContent = `Hello ${TalantName}`
    WelcomeMessageDiv.appendChild(welcomeMessage)

    const ExitBtn = document.createElement("button");
    ExitBtn.textContent = "Exit";

    ExitBtn.addEventListener("click", function() {
        localStorage.clear("talentToken")
        window.location.reload();
    });
    WelcomeMessageDiv.appendChild(ExitBtn)
    userInfoAndProgress.appendChild(WelcomeMessageDiv)
    document.getElementById("helloMessage").appendChild(userInfoAndProgress)



}

function TalentPersonalInfos(contentPage) {
    // Create a container div
    const PersonalInfoAndSKills = document.createElement("div");
    PersonalInfoAndSKills.className = "PersonalInfoAndSKills";
    PersonalInfoAndSKills.id = "PersonalInfoAndSKills";
    const container = document.createElement("div");
    container.className = "personalInfoContainer"; // You can style this with CSS later

    PersonalInfoAndSKills.appendChild(container)
    const infoUserPersonnel = document.createElement("h1");
    infoUserPersonnel.className = "infoHeader";
    infoUserPersonnel.textContent = "Talent Personal Informations";

    const talentUsername = document.createElement("div");
    talentUsername.className = "infoUser";
    talentUsername.textContent = `Username: ${infoUser.login}`;

    const talentPhoneNumber = document.createElement("div");
    talentPhoneNumber.className = "infoUser";
    talentPhoneNumber.textContent = `Phone number: ${infoUser.attrs.tel}`;
console.log(infoUser.totalUp, "receiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiive")

    const talentEmail = document.createElement("div");
    talentEmail.className = "infoUser";
    talentEmail.textContent = `Mail: ${infoUser.attrs.email}`;

    const talentGender = document.createElement("div");
    talentGender.className = "infoUser";
    talentGender.textContent = `Gender: ${infoUser.attrs.gender}`;

    const firstName = document.createElement("div");
    firstName.className = "infoUser";
    firstName.textContent = `FullName: ${infoUser.attrs.firstName} ${infoUser.attrs.lastName}`;


    const levelUser = document.createElement("div");
    levelUser.className = "infoUser";
    levelUser.textContent = `Level: ${talentLevel()}`;

    // Append all the infos to the container
    container.appendChild(infoUserPersonnel);
    container.appendChild(talentUsername);
    container.appendChild(firstName);
    container.appendChild(levelUser);
    container.appendChild(talentPhoneNumber);
    container.appendChild(talentEmail);
    container.appendChild(talentGender);

    // Then append the container to the page
    contentPage.appendChild(container);
}
function auditRatio() {

    const title = document.createElement("h2")
    title.textContent = "Audit Ratio"
    document.getElementById("auditRatio").appendChild(title)
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 1200);
    svg.setAttribute("height", 400);
    svg.style.boxShadow = "0 0 0 3px steelblue"; 

// First rectangle: "done"
const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rect1.setAttribute("x", "20");
rect1.setAttribute("y", "10");
rect1.setAttribute("width", (infoUser.totalDown/1000));
rect1.setAttribute("height", "60");
rect1.setAttribute("fill", "#4CAF50");

// Text for first rectangle
const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
text1.setAttribute("x", "100");
text1.setAttribute("y", "35");
text1.setAttribute("font-size", "20");
text1.setAttribute("fill", "white");
text1.setAttribute("text-anchor", "middle");
text1.textContent = `done:${infoUser.totalDown/1000}Kb`;

// Second rectangle: "receive"
const rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rect2.setAttribute("x", "20");
rect2.setAttribute("y", "70");
rect2.setAttribute("width", (infoUser.totalUp/1000));
rect2.setAttribute("height", "60");
rect2.setAttribute("fill", "#2196F3");

// Text for second rectangle
const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
text2.setAttribute("x", "100");
text2.setAttribute("y", "95");
text2.setAttribute("font-size", "20");
text2.setAttribute("fill", "white");
text2.setAttribute("text-anchor", "middle");
text2.textContent = `receive:${infoUser.totalUp/1000} Kb`;

// Append everything to the SVG
svg.appendChild(rect1);
svg.appendChild(text1);
svg.appendChild(rect2);
svg.appendChild(text2);
console.log(infoUser.totalUp, "infooooooooooooooooooooooooouserrrrrrrrrrrrrrrrrrr")
     document.getElementById("auditRatio").appendChild(svg)



}
//AhmedMalki@1998
function createRadarChart(data) {

    const yourSkills = document.createElement("h3");
    yourSkills.textContent= `Your skills : `;
    document.getElementById("talentSkills").appendChild(yourSkills);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 600);
    svg.setAttribute("height", 400);

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // create line progress
    data.forEach((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Création de la ligne jusqu'à 100%
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
        line.setAttribute("stroke-width", 2);
        svg.appendChild(line);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("fill", "white");
        label.setAttribute("font-size", "14px");
        label.setAttribute("text-anchor", "middle"); 
        label.setAttribute("alignment-baseline", "middle"); 
        label.textContent = `${data[index].type} : ${data[index].amount}`; 
        svg.appendChild(label);
    });

    const polyPoints = data.map((value, index) => {
        const angle = (Math.PI * 2 * index) / data.length;
        const x = centerX + (radius * value.amount) / 100 * Math.cos(angle);
        const y = centerY + (radius * value.amount) / 100 * Math.sin(angle);
        return `${x},${y}`;
    });
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", polyPoints.join(" "));
    polygon.setAttribute("fill", "rgba(255, 0, 0, 0.5)");
    svg.appendChild(polygon);
    document.getElementById("talentSkills").appendChild(svg);

  
}


function generateAuditRatio() {
const ratioInfo = document.createElement("div")
ratioInfo.className = "ratioInfo"
const title = document.createElement("h3")
title.textContent =`Audit Ration : `;
ratioInfo.appendChild(title)
// const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
// svg.setAttribute("width", 600);
// svg.setAttribute("height", 400);
//     // const width = 600;
//     // const height = 400;
//     // const centerX = width / 2;
//     // const centerY = height / 2;
//     // const radius = Math.min(width, height) / 2 - 20;

//     ratioInfo.appendChild(svg)
    document.getElementById("allContent").appendChild(ratioInfo)

}

function talentLevel(){

    let level;

    for (let i = 0; i < infoUser.transactions.length-1; i++){
        if (infoUser.transactions[i].type === "level"){
            level = infoUser.transactions[i].amount
            console.log(level, "level")
        }
    }

    return level
}


function transactionsEXP(){
    console.log(infoUser.transactions, "transactions")
    let array = [];
    for(let i = 0; i < infoUser.transactions.length-1; i++){
        if (infoUser.transactions[i].type ==="xp"){
            array.push(Number(infoUser.transactions[i].amount))  //array.push(Number(infoUser.transactions[i].amount)/1000)

        }
    }
    console.log(array, "transactionsEXP")
    return array
}


function generateGraphLinear() {

    // const xpAlltransact = document.createElement("div");
    // xpAlltransact.className="graphDiv";

    const XPprogression= document.createElement("h3");
    XPprogression.className="infoUser";
    XPprogression.textContent = "XP Progression";

    // find the max and min value 
    const maxAmount = Math.max(...transactionsEXP());
    const minAmount = Math.min(...transactionsEXP());

    let sommeOfAllValues = transactionsEXP().reduce((acc, curr) => acc + curr, 0);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.style.boxShadow = "0 0 0 3px steelblue"; 

    svg.setAttribute("viewBox", "0 0 1200 400");

    // Set width and height to 100% to make the SVG responsive
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

// Set width and height to 100% to make it responsive

    // Ajout the data to l'axe  Y
    for (let i = 0; i <= 9; i++) {
        if (i === 0 ){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10);
            text.setAttribute("y", y); 
            text.setAttribute("fill", "white"); //
            text.textContent = i * 100; // graduation value
            svg.appendChild(text);
        }else if(i===6){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10);
            text.setAttribute("y", y); 
            text.setAttribute("fill", "white"); //
            text.textContent = `Total XP : ${sommeOfAllValues/1000}Xp`; // graduation value
            svg.appendChild(text);
        }else if(i===7){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10);
            text.setAttribute("y", y ); 
            text.setAttribute("fill", "white"); //
            text.textContent =`Low Transaction: ${minAmount/1000}KB`;
            svg.appendChild(text);
        }else if(i===9){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10); 
            text.setAttribute("y", y); 
            text.setAttribute("fill", "white"); 
            text.textContent = `Transactions: ${transactionsEXP().length}`; // 
            svg.appendChild(text);
        }else if(i===8){
            const sum = transactionsEXP().reduce((acc, curr) => acc + curr, 0);
            console.log(sum, "summmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
            const average = sum / transactionsEXP().length;
            const roundedAverage = Math.round(average);
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10);
            text.setAttribute("y", y ); 
            text.setAttribute("fill", "white"); 
            text.textContent =`Transaction average: ${roundedAverage/1000}KB`;
            svg.appendChild(text);
        }else if(i === 5){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 10);
            text.setAttribute("y", y ); 
            text.setAttribute("fill", "white"); //
            text.textContent =`Big Transaction ---> ${maxAmount/1000}Kb`;
            svg.appendChild(text);
        }
    }

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    let amountValue = 0;

    //convert values to point 
    const points = transactionsEXP().map((value, index) => {
        amountValue = amountValue+value
        console.log(amountValue, "amountValueeeeeeeeeeeeeeeee")
        const x = index * 30; 
        const y = 400 - (amountValue / sommeOfAllValues) * 400; 
        console.log(y, "yyyyyyyyyyyyy")
        return `${x},${y}`;
    }).join(" ");

    console.log(transactionsEXP(), "Transactionssssssssssss")

    console.log(points, "pointsssssssssssssssssssssssssssss")

    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "green"); 
    line.setAttribute("stroke-width", 3); 

    svg.appendChild(line);


   document.getElementById("xpProgress").appendChild(XPprogression)
    document.getElementById("xpProgress").appendChild(svg)
}


function generateAuditRatio() {


}

// func to create a bar graph with SVG for audit points
function generateGraphBar() {
    const data = transactPointAudits(); 
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 1100); 
    svg.setAttribute("height", 800); 
    svg.style.boxShadow = "0 0 0 3px white"; 

 

    const auditAllTarnsact = document.createElement("h3");
    auditAllTarnsact.className="infoUser";
    auditAllTarnsact.textContent=`Number of audit you passed: ${data.length}\n`;

    document.getElementById("auditPassed").appendChild(auditAllTarnsact);

    // document.getElementById("auditPassed").appendChild(xpAlltransact)

    const chartWidth = 1100; 
    const chartHeight = 800; 
    const barWidth = chartWidth / data.length; 

    const maxValue = Math.max(...data.map(item => Math.abs(item.amount))); 

    const dataBig = data.filter((value)=> value.amount=== maxValue)
    
    for (let i = 0; i <= 9; i++) {
        if (i === 9 ){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0); 
            text.setAttribute("y", y); 
            text.setAttribute("fill", "white"); 
            text.textContent = `Audit le plus gros ---> ${dataBig[0].path} ,`; 
            svg.appendChild(text);
        }else if (i===7){
            const y = 400 - i * 40; 
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 0);
            text.setAttribute("y", y); 
            text.setAttribute("fill", "white"); 
            text.textContent = `with more than ${dataBig[0].amount} points  exp`;
            svg.appendChild(text);
        }
    }

    // Create an SVG elems  for each bar
    data.forEach((value, index) => {
        let barHeight = (Math.abs(value.amount) / maxValue) * chartHeight; 
        if (value.type === "down") {
            barHeight *= -1; // reverst the height fro the down's bar
        }
        const x = index * barWidth; // Position horizontale of the bar
        const y = chartHeight - Math.max(0, Math.abs(barHeight)); // Position verticale of the bar
    
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", Math.abs(barHeight));
        rect.setAttribute("fill", value.type === "up" ? "green" : "red"); 
    
        svg.appendChild(rect);
    });    

    document.getElementById("auditPassed").appendChild(svg)

}
function transactPointAudits(){
    let array = [];
    for(let i = 0; i < allTransactInfo.length-1; i++){
        let transact = allTransactInfo[i].type;
        if (transact === "up" || transact === "down"){
            array.push(allTransactInfo[i])
        }
    }
    return array
}

function transactSkill(){
    let obj1 ={
        amount: 0,
        createdAt: "",
        id: 0,
        objectId: 0,
        path: "",
        type: "",
        userId: 0
    }
    let obj = {
        go : obj1,
        js : obj1,
        algo : obj1,
        front : obj1,
        back : obj1,
        prog : obj1
    }
    for(let i = 0; i < allTransactInfo.length-1; i++){
        let transact = allTransactInfo[i].type;
        switch (transact){
            case "skill_prog":
                if (allTransactInfo[i].amount > obj.prog.amount){
                    obj.prog = allTransactInfo[i];
                }
                break
            
            case "skill_go":
                if (allTransactInfo[i].amount > obj.go.amount){
                    obj.go = allTransactInfo[i];
                }
                break

            case "skill_js":
                if (allTransactInfo[i].amount > obj.js.amount){
                    obj.js = allTransactInfo[i];
                }
                break

            case "skill_front-end":
                if (allTransactInfo[i].amount > obj.front.amount){
                    obj.front = allTransactInfo[i];
                }
                break

            case "skill_back-end":
                if (allTransactInfo[i].amount > obj.back.amount){
                    obj.back = allTransactInfo[i];
                }
                break

            case "skill_algo":
                if (allTransactInfo[i].amount > obj.algo.amount){
                    obj.algo = allTransactInfo[i];
                }
                break
            default:
                break
        }
    }
    let array = [];
    array.push(obj.algo);
    array.push(obj.back);
    array.push(obj.front);
    array.push(obj.go);
    array.push(obj.js);
    array.push(obj.prog);
    return array
}


