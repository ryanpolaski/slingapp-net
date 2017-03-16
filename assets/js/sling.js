/**
 * Created by ian on 11/12/16.
 */
console.info("Loaded sling.js");

//globals
var MINPASSLENGTH = 6;
var MAXPASSLENGTH = 30;

var Resource = {
    info:{},
    dictionary:{},
    /**
     *
     * @param resource - the web path of the resource to be loaded
     * @param name - the name to reference the resource by
     * @param callback - an optional function to call when the resource has been loaded
     */
    load:function (resource, name, callback) {
        Resource.info[name] = {resource:resource, status:"Not Loaded"};
        get(resource, "", function(data){
            Resource.dictionary[name] = document.createElement("div");
            Resource.dictionary[name].innerHTML = data;
            if(callback) callback(data);
            Resource.info[name].status = "Loaded";
        });

    },
    require:function(name){
          
    },
    get:function(name){
        return Resource.dictionary[name];
    }
};

var Toast = {
    pop:function(node, classname, timeout){
        if(!timeout) timeout = 3000;
        var toast = document.createElement("div");
        toast.className = "toast " + classname;
        toast.appendChild(node);
        document.body.appendChild(toast);
        setTimeout(function(){
            document.body.removeChild(toast);
        },timeout)
    },
    error:function (node, timeout) {
        Toast.pop(node, "error", timeout);
    }
};

var Modal = {
    current:null,
    stack:[],
    modal:null,
    dict:{},
    init:function(){
        document.body.innerHTML += "<div id='modal' ></div>";
        Modal.modal = document.getElementById("modal");
    },
    create:function(resourceName, classname, onblur) {
        var modalContents = Resource.get(resourceName);
        if (modalContents != null) {
            modalContents.className = "flex";
            Modal.modal.innerHTML = "";
            Modal.modal.appendChild(modalContents);
            Modal.modal.className = classname;
            Modal.modal.style.visibility = "visible";

            Modal.modal.onclick = function () {
                Modal.hide();
                if (onblur) {
                    console.log("onblur");
                    onblur();
                }
            };
            Modal.current = resourceName;
        } else {
            console.error("Resource " + resourceName + " has not been loaded.  Load the resource first with Resource.load()");
        }
    },
    hide:function(){
        if(Modal.current){
            Modal.modal.style.visibility = "hidden";
        }
    },
    show:function(resource){
        if(resource){
            if(resource in Modal.dict) return false;
            Modal.modal.innerHTML = "";
            Modal.modal.appendChild(Modal.dict[resource]);
        }else{
            Modal.modal.style.visibility = "visible";
        }
        return true;
    },
    destroy:function(){
        if(Modal.current){
            Modal.current = null;
        }
    },
    pushCurrent:function(){
        if(Modal.current){
            var current = Modal.modal.firstChild;
            Modal.stack.push(current);
        }
    }
};


var ContextMenu = {
    current:null,
    base:null,
    init:function(){
        ContextMenu.base = document.createElement("div");
        ContextMenu.base.className = "context-menu";
        ContextMenu.base.onclick = function (event) {
            event.stopPropagation();
        };

        document.addEventListener("click", function(){
            if(ContextMenu.current){
                document.body.removeChild(ContextMenu.current);
                ContextMenu.current = null;
            }
        });
    },
    /**
     *
     * @param mouseEvent
     * @param nodeList
     * @returns {boolean}
     *
     * Decription:  Creates a context menu and appends it to the body of the HTML doc.
     *              Requires the right-click mouse event and a list of HTML Elements
     *              that are to be included inb the context menu
     */
    create:function(mouseEvent, nodeList){
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        ContextMenu.close();

        if(!ContextMenu.base) ContextMenu.init();

        ContextMenu.current = ContextMenu.base.cloneNode(false);
        ContextMenu.appendNodes(nodeList);
        ContextMenu.current.style.left = event.pageX;
        ContextMenu.current.style.top = event.pageY;
        document.body.appendChild(ContextMenu.current);
        return false;
    },
    /**
     * Closes the current open context menu
     */
    close:function(){
        if(ContextMenu.current){
            document.body.removeChild(ContextMenu.current);
            ContextMenu.current = null;
        }
    },
    /**
     * Do not call publicly, only internally used
     * @param nodeList
     */
    appendNodes:function(nodeList){
        var menuitemslen = nodeList.length;
        for(var i = 0; i<menuitemslen; i++){
            ContextMenu.current.appendChild(nodeList[i]);
        }
    },
    /**
     *
     * @param label
     * @param classname
     * @param onclick
     * @returns {Element}
     * Description: Creates a menu link (<a> element).  Requires the name of the link, any
     *              classnames the link should have, can be none, and the callback to execute
     *              when the link is clicked.
     */
    createMenuLink:function(label, classname, onclick){
        var link = document.createElement("a");
        link.innerHTML = label;
        link.className = classname;
        link.onclick = onclick;
        return link;
    },
    createLabel:function(text){
        var label = document.createElement('p');
        label.innerHTML = text;
        return label;
    }
};

function get(url, parameters, callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            callback(xhr.responseText, xhr.status);
        }
    };
    xhr.open("GET", url + parameters, true);
    xhr.send();
}

/******************************************************************************************************************
 // ACCOUNT FUNCTIONS //
 ******************************************************************************************************************/
function submitLogin() {
    var form = document.getElementById("loginForm");
    var error = document.getElementById("loginerror");
    var email = form.elements["email"];
    var password = form.elements["pass1"];
    var emailRegex = new RegExp("[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
    var passRegex = new RegExp(".{6,30}");

    error.innerHTML = "";

    var formError = (validateEntry(email, emailRegex)) ? false : displayError(email, error, "Invalid email address");
    formError = (validateEntry(password, passRegex) && !formError) ? formError : displayError(password, error, "Password Length: 6-30");

    if(!formError) {
        document.getElementById("loginerror").innerHTML = "<div class='sling' style=''></div>";

        return $.ajax({
            type: 'post',
            url: 'assets/php/components/account.php',
            dataType: 'JSON',
            data: {
                action: "login",
                email: email.value,
                pass1: password.value
            },
            success: function (data) {
                if (!data.hasOwnProperty('error') && validateCredentials(data)) {
                    var button = document.getElementById("login-button");
                    button.innerHTML = "Logout";
                    button.className = "login-button";
                  
                    document.getElementById("LoggedOutNavBar").style.display = "none";
                    document.getElementById("LoggedInNavBar").style.display = "inline-block";
                    document.getElementById("NavName").innerHTML = email;
                    document.getElementById("loginForm").reset();
                    SetCookie("Token", data.LoginToken, 7);
                    Modal.hide();
                    getRoomData();
                }
                else
                    error.innerHTML = data.error;

                //Provide Recent Rooms Info

                return data;
            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}

function showLogin() {
    document.getElementById("login-button").className += " open";

    setTimeout(function () {
            Modal.create("Login Form", "", hideLogin)
        }, 700
    );
}

function isLoggedIn() {

    var token;

    if(!(token = GetToken()))
        tempRegister();
    else
        CheckTokenValidity(token, 'tempRegister');

    var login = document.getElementById("login-button");
    var screenshot = document.getElementById("screenshot");
    var loggedIn = (token && token[0] == '1');
    //Provide Recent Rooms Info
    return loggedIn;
}

function hideLogin(data) {
    var button = document.getElementById("login-button").className = "login-button";
    Modal.hide();
}

function validateEntry(entry, regex) {
    if((regex && regex.test(entry.value)) && !(entry.value == "")) {
        entry.classList.remove("form-control-error");
        return true;
    } else
        entry.classList.add("form-control-error");

    return false;
}

//If both passwords match, change the second password's background color to green
function checkPasswords(form) {
    //console.log(form);
    pass1 = form.elements['pass1'];
    pass2 = form.elements['pass2'];
    var passRegex = new RegExp(".{6,30}");

    if(passRegex.test(pass1.value) && pass1.value == pass2.value) {
        pass2.classList.remove("form-control-red");
        pass2.classList.add("form-control-green");
    }
    else if(pass2.classList.contains("form-control-green"))
        pass2.classList.remove("form-control-green");
}

function validatePasswords(pass1, pass2) {
    var error = document.getElementById("registererror");

    if (!pass2.value || pass1.value != pass2.value) {
        if(pass2.value.length == 0) {
            pass2.classList.add("form-control-error");

        } else
            pass2.classList.add("form-control-red");
        return false;
    }
    return true;
}

function displayError(field, errorElement, errormsg) {
    if(errorElement.innerHTML == "") {
        errorElement.innerHTML = errormsg;
        field.focus();
    }

    return true;
}

function clearError(){ document.getElementById("registererror").innerHTML = ""; }

function submitRegister() {
    var form = document.getElementById("registerForm");
    var error = document.getElementById("registererror");
    var first = form.elements["fname"];
    var last = form.elements["lname"];
    var email = form.elements["email"];
    var pass1 = form.elements["pass1"];
    var pass2 = form.elements["pass2"];
    var token = GetToken();
    var nameRegex = new RegExp("[a-zA-Z]{2,30}");
    var passRegex = new RegExp(".{6,30}");
    var emailRegex = new RegExp("[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");

    //reset error message
    error.innerHTML = "";

    var formError = validateEntry(first, nameRegex) ? false : displayError(first, error, "Invalid first name, Length: 2-30");
    formError = (validateEntry(last, nameRegex) && !formError) ? formError : displayError(last, error, "Invalid last name, Length: 2-30");
    formError = (validateEntry(email, emailRegex) && !formError) ? formError : displayError(email, error, "Invalid email address");
    formError = (validateEntry(pass1, passRegex) && !formError) ? formError : displayError(pass1, error, "Password Length: 6-30");
    formError = (validatePasswords(pass1, pass2) && !formError) ? formError : displayError(pass2, error, "passwords do not match");

    if (!formError) {
        error.innerHTML = "<div class='sling' style=''></div>";

        return $.ajax({
            type: 'post',
            url: 'assets/php/components/account.php',
            dataType: 'JSON',
            data: {
                action: "register",
                fname: first.value,
                lname: last.value,
                email: email.value,
                pass1: pass1.value,
                pass2: pass2.value,
                token: token
            },
            success: function (data) {
                var error = document.getElementById("registererror");

                if (!data.hasOwnProperty('error')) {
                    var button = document.getElementById("login-button");
                    button.innerHTML = "Logout";
                    button.className = "login-button";
                    document.getElementById("NavName").innerHTML = first;
                    document.getElementById("LoggedOutNavBar").style.display = "none";
                    document.getElementById("LoggedInNavBar").style.display = "inline-block";
                    document.getElementById("registerForm").reset();
                    SetCookie("Token", data.LoginToken, 7);
                    error.innerHTML = "";
                    Modal.hide();
                } else
                    error.innerHTML = data.error;

                return data;
            },
            error: function (error) {
                console.log(error);
            }
        });
    } else
        form.reportValidity();
}

function tempRegister() {
    return $.ajax({
        type: 'post',
        url: 'assets/php/components/account.php',
        dataType: 'JSON',
        data: {
            action: "nocookie"
        },
        success: function (data) {
            SetCookie("Token", data.LoginToken, 7);
            Modal.hide();
            return data;
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function logout() {
    DeleteCookie("Token");

    window.location.replace("https://dev.slingapp.net");

    var loggedOutNav = document.getElementById("LoggedOutNavBar");
    loggedOutNav.style.display = "inline-block";

    var loggedInNav = document.getElementById("LoggedInNavBar");
    loggedInNav.style.display = "none";

    document.getElementById("login-button").innerHTML = "Login<span id='reg'><br>or sign up</span>";
}

function validateCredentials(data) {
    var loginError = document.getElementById("loginerror");

    if (data) {
        loginError.innerHTML = "<br>";
        return true;
    }
    else {
        loginError.innerHTML = "Username or password is Incorrect";
        return false;
    }
}

function getRoomData() {
    return $.ajax({
        type: 'post',
        url: 'assets/php/components/account.php',
        dataType: 'JSON',
        data: {
            action: "roomdata",
            token: GetToken()
        },
        success: function (data) {
            console.log(data);

            for(elem = 0; elem < 4; elem++){

                if(data.length > 0) {
                    var roomName = data[elem].RoomName;
                    var active = data[elem].Active;
                    if (roomName.length == 0)
                        roomName = " Unnamed ";
                    if(active == 1)
                        active = " ACTIVE";
                    if(active == 0)
                        active = " INACTIVE";

                    var prevRoomName = document.createElement('li');
                    var dataStream = document.createElement('span');
                    dataStream.innerHTML = "RoomTitle: " + roomName + "\nStatus: " + active;
                    prevRoomName.id = "Room" + elem;
                    prevRoomName.className = 'icon-off';

                    document.getElementById('RoomsNav').appendChild(prevRoomName);
                    // document.getElementById("Room" + elem)
                    prevRoomName.appendChild(dataStream);
                    document.getElementById("NoRooms").innerHTML = "";
                }
            }

            //Provide Recent Rooms Info
            return data;
        },
        error: function (error) {
            console.log(error);
        }
    });
}

function clearRecentRooms() {
    //var prevRoomName = document.createElement('li');
    //for(i = 0; i < document.getElementById('RoomsNav').childElementCount; i++)
        document.getElementById('RoomsNav').clearAttributes();
    //prevRoomName.destroy();
}

/******************************************************************************************************************
 // ROOM FUNCTIONS //
 ******************************************************************************************************************/
function joinroom(event, f) {
    event.preventDefault();
    console.log(f);
    var code = f["room"].value;
    $.ajax({
        type: 'post',
        url: 'assets/php/components/room.php',
        dataType: 'JSON',
        data: {
            action: "join",
            token: GetToken(),
            code: code
        },
        success: function (data) {
            var roomid = data.RoomID;
            console.log(data);
            window.location = "/rooms/" + roomid;
        },
        error: function (error) {
            console.log(error);
        }
    });

    return false;
}

function CreateRoom(event, element) {
    var roomname = element.roomname.value;
    var token;

    if (!(token = GetToken()))
        tempRegister();

    var errordiv = element.querySelector("#error");

    errordiv.innerHTML = "<div class='sling' style=''></div>";
    $.ajax({
        type: 'post',
        url: 'assets/php/components/room.php',
        dataType: 'JSON',
        data: {
            action: "create",
            roomname: roomname,
            token: token
        },
        success: function (data) {
            errordiv.innerHTML = "Success";
            window.location = "/rooms/" + data.RoomID;
        },
        error: function (error) {
            console.log(error);
        }
    });
    event.stopPropagation();
    event.preventDefault();
}


/******************************************************************************************************************
 // COOKIE FUNCTIONS //
 ******************************************************************************************************************/

function GetToken() {
    var cstring = document.cookie;
    var cookies = cstring.split(";");
    var tokenstr = null;
    var rvalue;
    cookies.forEach(function (c) {
        if (c.search(/Token/) != -1)
            tokenstr = c;
    });
    if (tokenstr != null) {
        var keynval = tokenstr.split("=");
        // var key = keynval[0];
        rvalue = keynval[1];
    }
    else
        rvalue = null;
    return rvalue;
}

function SetCookie(key, value, daysTillExp) {
    var date = new Date();
    date.setTime(date.getTime() + (daysTillExp*24*60*60*1000));
    var expires = "expires="+ date.toUTCString();
    document.cookie = key + "=" + value + ";" + expires + ";path=/";
}

function DeleteCookie(key) {
    document.cookie = key +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function CheckTokenValidity(token, callback){
    $.ajax({
        type: 'post',
        url: '/assets/php/components/account.php',
        dataType: 'JSON',
        data: {
            action: "tokenisvalid",
            token: token
        },
        error: function (error) {
            console.log(error);
        }
    });
}

/******************************************************************************************************************
 // MISC FUNCTIONS //
 ******************************************************************************************************************/

function toggleform(e) {
    if (e.value === "Join Room") {
        e.value = "";
    }
    else if (e.value === "") {
        e.value = "Join Room";
    } else {
    }
}

function noprop(e) {
    e.stopPropagation();
    return false;
}

HTMLElement.prototype.removeClass = function(classname) {
    this.className = this.className.replace(new RegExp(" ?" + classname), "");
};