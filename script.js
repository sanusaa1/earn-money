import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
set,
get,
child
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


const firebaseConfig = {
apiKey: "AIzaSyCCS0jLa76zh0ROcHXthmJ2GgMwOCSKKnc",
authDomain: "ftp-earning-app.firebaseapp.com",
databaseURL: "https://ftp-earning-app-default-rtdb.firebaseio.com",
projectId: "ftp-earning-app",
storageBucket: "ftp-earning-app.firebasestorage.app",
messagingSenderId: "357389565630",
appId: "1:357389565630:web:da32026f969599d43528ef",
measurementId: "G-QDMY4YJPV4"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);



document.addEventListener("DOMContentLoaded",()=>{


function generateReferralCode(){

    const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code="";

    for(let i=0;i<6;i++){

        code += chars.charAt(
            Math.floor(Math.random()*chars.length)
        );

    }

    return code;

}



const passwordBtn = document.querySelector(".password-btn");
const passwordInput = document.getElementById("password");


const signupForm = document.getElementById("signupForm");


const phoneInput = document.getElementById("phone");
const nicknameInput = document.getElementById("nickname");

const inviteCodeInput = document.getElementById("inviteCode");


const popupOk = document.getElementById("popupOk");



/* POPUP CLOSE */

if(popupOk){

popupOk.addEventListener("click",()=>{

    document.getElementById("popup").style.display="none";

});

}




/* PASSWORD SHOW HIDE */

if(passwordBtn){

passwordBtn.addEventListener("click",()=>{


    if(passwordInput.type==="password"){


        passwordInput.type="text";


        passwordBtn.innerHTML =
        '<i class="fa-solid fa-eye"></i>';


    }else{


        passwordInput.type="password";


        passwordBtn.innerHTML =
        '<i class="fa-regular fa-user"></i>';

    }


});

}




/* AUTO FILL REFERRAL CODE */


const urlParams = new URLSearchParams(window.location.search);

const refCode = urlParams.get("ref");


if(refCode && inviteCodeInput){


    inviteCodeInput.value = refCode;

    inviteCodeInput.readOnly=true;


}





/* REGISTER USER */


if(signupForm){


signupForm.addEventListener("submit",async(e)=>{


e.preventDefault();



const phone = phoneInput.value.trim();

const password = passwordInput.value.trim();

const nickname = nicknameInput.value.trim();

const inviteCode = inviteCodeInput.value.trim();


const myReferralCode = generateReferralCode();



if(phone.length!==10){

showPopup(
"Error",
"Enter valid phone number",
"error"
);

return;

}



if(password.length<6){

showPopup(
"Error",
"Password must be at least 6 characters",
"error"
);

return;

}



if(nickname===""){


showPopup(
"Error",
"Enter nickname",
"error"
);


return;

}





try{


const dbRef = ref(db);



const existingUser = await get(

child(dbRef,"Users/"+phone)

);



let referrerPhone=null;




/* CHECK INVITE CODE */


if(inviteCode!==""){


const users = await get(
ref(db,"Users")
);



if(users.exists()){


users.forEach(user=>{


if(user.val().referralCode===inviteCode){


referrerPhone=user.key;


}


});


}




if(referrerPhone===null){


showPopup(
"Error",
"Invalid Invite Code",
"error"
);


return;


}


}






if(existingUser.exists()){


showPopup(
"Error",
"Phone number already registered",
"error"
);


return;


}







/* SAVE USER */


await set(
ref(db,"Users/"+phone),
{


phone:"+91"+phone,


password:password,


nickname:nickname,


inviteCode:inviteCode,


referralCode:myReferralCode,


balance:0,


withdrawBalance:0,


totalIncome:0,


todayIncome:0,


teamIncome:0,


teamCount:0,


status:"active",


registerTime:Date.now()


}

);







/* ADD TEAM */


if(referrerPhone){



await set(

ref(
db,
"Users/"+referrerPhone+"/team/"+phone
),

{


phone:"+91"+phone,


nickname:nickname,


referralCode:myReferralCode,


joinTime:Date.now()


}

);




const referrerSnap = await get(

ref(db,"Users/"+referrerPhone)

);



const oldCount = Number(
referrerSnap.val().teamCount || 0
);



await set(

ref(
db,
"Users/"+referrerPhone+"/teamCount"
),

oldCount+1

);



}






showPopup(
"Success",
"Account Created Successfully"
);



signupForm.reset();




setTimeout(()=>{


location.href="download.html";


},2000);






}catch(error){



console.log(error);



showPopup(

"Firebase Error",

error.message,

"error"

);



}



});


}



});






function showPopup(title,message,type="success"){


const popup=document.getElementById("popup");


if(!popup) return;



document.getElementById("popupTitle").innerText=title;


document.getElementById("popupMessage").innerText=message;



const icon=document.getElementById("popupIcon");



if(type==="error"){


icon.innerHTML="✖";

icon.style.background="#ff3b30";


}else{


icon.innerHTML="✔";

icon.style.background="#19c463";


}



popup.style.display="flex";

}
