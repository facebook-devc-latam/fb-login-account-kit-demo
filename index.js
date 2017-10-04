var APP_ID = '596457057161787';
// var APP_ID = '152354135353469';


// Loading dinamically the Facebook SDK
(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// First, we need to initialize the Facebook API;
// You should register an application on https://developers.facebook.com/
// and then use the 'appId' here.
// Check the API version you want to use.
window.fbAsyncInit = function() {
    FB.init({
      appId : APP_ID,
      cookie : true,
      xfbml : true,
      version : 'v2.10'
    });
    // Register a pageview on Facebook Analytics
    FB.AppEvents.logPageView();

    // As soon as the page is loaded, let's check the login state, if the user
    // is already authenticated or not.
    checkLoginState();
};

// Here we're using the Facebook API to check the login status.
// The 'getLoginStatus' method return a response with 'connected'.
function checkLoginState() {
  console.log("checkLoginState");
    FB.getLoginStatus(function(response) {
      console.log("FB.getLoginStatus response");
        if(response.status === 'connected'){
            fbLogin();
        }
    });
}

 // initialize Account Kit
 AccountKit_OnInteractive = function(){
    AccountKit.init(
      {
        appId:APP_ID,
        state: new Date().toString(),
        version:"v1.1",
        fbAppEventsEnabled:true,
        debug:true
      }
    );
  };

// login callback
function loginCallback(response) {
  var logged = document.querySelector("#logged");
  console.log(response)
  if (response.status === "PARTIALLY_AUTHENTICATED") {
      var code = response.code;
      var csrf = response.state;
      logged.innerHTML = `<br>Welcome, you are now authenticated. <img style="width:50px;height:50px;" src='img/logged.png'>`;
      // Send code to server to exchange for access token
  }
  else if (response.status === "NOT_AUTHENTICATED") {
      // handle authentication failure
  }
  else if (response.status === "BAD_PARAMS") {
      // handle bad parameters
  }
}

// phone form submission handler
function smsLogin() {
  var countryCode = document.getElementById("country_code").value;
  var phoneNumber = document.getElementById("phone_number").value;
  AccountKit.login(
    'PHONE',
    {countryCode: countryCode, phoneNumber: phoneNumber}, // will use default values if not specified
    loginCallback
  );
}


// email form submission handler
function emailLogin() {
  var emailAddress = document.getElementById("email").value;
  AccountKit.login(
    'EMAIL',
    {emailAddress: emailAddress},
    loginCallback
  );
}

function fbLogout() {
  var bt = document.getElementById("fb-login");
  var logged = document.querySelector("#logged");
  FB.logout((response) => {
      bt.innerHTML = 'Facebook Login';
      bt.onclick = fbLogin;
      logged.innerHTML = '';
    });
}

// Facebook login button using the SDK and Graph API
function fbLogin() {
  console.log("fbLogin");
  var bt = document.querySelector("#fb-login");
  var logged = document.querySelector("#logged");

  // Calling the 'login' method
  FB.login((response)=> {
    console.log("FB.login response");
      console.log(response);

      setupGraphDemo();

      // Success, user is logged
      if (response.status === 'connected') {
          // Change the login button to a logout button
          bt.innerHTML = 'Logout';
          bt.onclick = fbLogout;

          // Getting user info
          fetch(`https://graph.facebook.com/me?access_token=${response.authResponse.accessToken}`)
          .then((res)=> {return res.json()})
          .then((res) => {
              // Getting user picture
              const userPic = `https://graph.facebook.com/v2.10/${res.id}/picture?access_token=${response.authResponse.accessToken}`;
              logged.innerHTML = `<br>Welcome, ${res.name} <img src='${userPic}'>`;
              console.log(userPic)
          })
      } else {
      // User is not logged.
      }
    }, {scope: 'public_profile,email,user_friends,user_photos'});
}

function setupGraphDemo() {
  console.log('setup graph demo');
  var graphDemoNode = document.getElementById('graph_demo');
  graphDemoNode.style.display = "initial";
}

function getFriends() {
  console.log("get friends");

  FB.api(
    '/me/friends/',
    'GET',
    {
      "fields":"id,name,picture"
    },
    getFriendsCallback(response)
  );
}

function getFriendsCallback(response) {
  if ( response.data ) {
    var friendsList = document.getElementById('friends_list');
    document.getElementById('friends_list_node').style.display = "initial";
    document.getElementById('friend_photos_list_node').style.display = "none";
    document.getElementById('photos_list_node').style.display = "none";

    while (friendsList.firstChild) {
      friendsList.removeChild(friendsList.firstChild);
    }

    parseFriendsResponse(response);
  }
}

function parseFriendsResponse(friendsResponse) {
  console.log("parse friends response");

  var friendsListNode = document.getElementById("friends_list_node");
  var friendsList = document.getElementById("friends_list");

  for ( var i=0; i<friendsResponse.data.length; i++ ) {
    var friend = friendsResponse.data[i];
    var li = document.createElement("li");
    li.innerHTML =
    `<div> ${friend.name}
    <img src='${friend.picture.data.url}'>
      <a onclick="getFriendPhotos(${friend.id})" class="waves-effect waves-light btn #4267b2 indigo">
        Get Friend Photos
      </a>
    </div>`;
    friendsList.appendChild(li);
  }
}

function getFriendPhotos(friendId) {
  console.log("get friend photos");

  FB.api(
    `/${friendId}/photos/`,
    'GET',
    { "fields":"id,picture,created_time" },
    function(response) {
      console.log("get friends response");
      console.log(response);

      document.getElementById('friend_photos_list_node').style.display = "initial";
      var friendPhotosList = document.getElementById("friend_photos_list");

      if ( response.data ) {
        while (friendPhotosList.firstChild) {
          friendPhotosList.removeChild(friendPhotosList.firstChild);
        }
        parsePhotosResponse(response, friendPhotosList);
      }
    }
  );
}

function parsePhotosResponse( response, parentNode ) {
  for ( var i=0; i<response.data.length; i++ ) {
    var photo = response.data[i];
    var li = document.createElement("li");
    li.innerHTML = `<div>${photo.created_time} <img src='${photo.picture}'> </div>`;
    parentNode.appendChild(li);
  }
}

function getPhotos() {
  console.log("get photos");

  FB.api(
    '/me/photos',
    'GET',
    { "fields":"id,picture,name,created_time" },
    function(response) {
      console.log("get photos response");
      console.log(response);

      var photosList = document.getElementById("photos_list");
      if ( response.data ) {
        document.getElementById('friends_list_node').style.display = "none";
        document.getElementById('photos_list_node').style.display = "initial";
        while (photosList.firstChild) {
          photosList.removeChild(photosList.firstChild);
        }
        parsePhotosResponse(response, photosList);
      }
    }
  );
}
