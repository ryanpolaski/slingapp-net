<?php
/**
 * Created by PhpStorm.
 * User: ian
 * Date: 10/14/16
 * Time: 8:09 AM
 */

?>
<html>
<head>
    <title>
        Sharing Site
    </title>
    <script type='text/javascript' src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.1.1.min.js"></script>
    <script type='text/javascript' src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/css/custom.css">
</head>
<body style="background-color: #4286f4;">
<div id="login-cont"
     style="position: fixed; width: 100%; height: 100%; visibility: hidden; color: white; z-index: 99999999999;">
    <center>
        <form id="loginForm"
              style="max-width: 300px; margin: 0 auto; margin-top: 100px" method="post"
              onsubmit="return SubmitLogin(this);">
            <h1 id="loginFormHeader">Login</h1>
            <h4 id="error"><br></h4>
            <input name="email" class="form-control" placeholder="email" type="email">
            <input name="pass1" class="form-control" placeholder="password" type="password">
            <button id="submitButton" type="button" onclick="submitLogin(this)">Submit</button>
        </form>

    </center>
</div>
<div class="container-fluid"
     style="background-color: rgba(255,255,255,1); text-align: center; padding-bottom: 30px; min-height: 50vh">
    <button id="login-button" class="login-button" onclick="showLogin()">Login</button>
    <h1 style="width:100%; text-align: center;">Sharing so easy you'll never go back</h1>
    <div class="wrapper">
        <div class="screenshot">
        </div>
    </div>

</div>

<div class="container" style="text-align: center; ">
    <div class="col-lg-6">
        <button class="btn-main" style=" width: 200px; margin: 30px">
            Share Screen
        </button>
    </div>
    <div class="col-lg-6">
        <form class="" style="margin: 30px;" onsubmit="joinroom(event, this);">
            <input name="room" class="mp-form" type="text" size="8" style="width: 200px; padding-left: 20px;"
                   value="Join a Room" placeholder="Room Code" onfocus="toggleform(this)" onblur="toggleform(this)">
        </form>
    </div>
</div>

</body>

<!-- use enter button to submit login info-->
<script>
    document.getElementById('loginForm').onkeypress = function (e) {
        if (e.keyCode == 13) {
            document.getElementById('submitButton').click();
        }
    }
</script>

<script>
    function toggleform(e) {
        if (e.value === "Join a Room") {
            e.value = "";
            e.style.color = "black";
            e.style.backgroundColor = "#fefefe";
        }
        else if (e.value === "") {
            e.value = "Join a Room";
            e.style.color = "white";
            e.style.backgroundColor = "transparent";
        } else {

        }
    }

    function joinroom(event, f) {
        event.preventDefault();
        console.log(f);
        var room = f["room"].value;
        window.location = "/room/" + room;
        return false;
    }

    function showLogin() {
        var button = document.getElementById("login-button");

        button.className += " open";

        setTimeout(function () {
            var loginarea = document.getElementById("login-cont");
            loginarea.style.visibility = "visible";
            console.log(loginarea);
        }, 700);
    }

    function submitLogin() {
        var form = document.getElementById("loginForm");
        var email = form.elements["email"].value;
        var password = form.elements["pass1"].value;

        return $.ajax({
            type: 'post',
            url: 'assets/php/components/account.php',
            dataType: 'JSON',
            data: {
                action: "login",
                email: email,
                pass1: password
            },
            success: function (data) {
                noErrors(data);
                return data;
            },
            error: function (error) {
                console.log(error);
            }
        });
    }

    function noErrors(data) {
        var loginError = document.getElementById("error");

        console.log(data);
        if(data) {
            loginError.innerHTML = "<br>";
            hideLogin(data)
        }
        else
            loginError.innerHTML = "Username or password is Incorrect";
    }

    function hideLogin(data) {
        var button = document.getElementById("login-button");
        var loginarea = document.getElementById("login-cont");
        var loginstate = document.getElementById("login-button");
        var loginFormH = document.getElementById("loginFormHeader");

        loginFormH.innerHTML = "Thank You ".concat(data['FirstName'].concat("!"));

        setTimeout(function () {
            loginstate.innerHTML = "logout";
            loginarea.style.visibility = "hidden";
            button.className += " close";
        }, 1400);
    }
</script>
</html>
