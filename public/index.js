///////////////////////////////
/////////////Login/////////////
///////////////////////////////

$(".loginform").on("submit", function(e) {
    e.preventDefault();
    var username = $(".username").val();
    var password = $(".password").val();
    console.log(`Username: ${username}. Password: ${password}`);
    window.alert = function() {};
    $.ajax('/api/auth/login', {
        method: 'POST',
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
        },
        data: {
            username: username,
            password: password
        },
        success: function() {
            console.log("The Request was succesful!");
            showResourceInput();
            loadData();
        },
        error: function() {
            console.log("THERE WAS AN ERROR");
            $(".loginerror").removeClass("hidden");
        }
    });
    console.log("A User has attempted to Login");
})

////////////////
////Register////
////////////////

//////////////////////
//SHOW Register Form//

$(".registerbutton").on("click", function(e) {
    e.preventDefault();
    console.log("Register Button was clicked");
    $(".register").removeClass("hidden");
    $(".login").addClass("hidden");
})

////////////////////////////////////////////////////////////////////////////////////
//Submit Username, Password, First Name and Last Name to register //////////////////
////////////////////////////////////////////////////////////////////////////////////

$(".registerform").on("submit", function(e) {
    e.preventDefault();
    let user = $(".usernameregister").val();
    let pw = $(".passwordregister").val();
    let firstName = $(".firstname").val();
    let lastName = $(".lastname").val();
    $.ajax('/api/users/', {
        method: 'POST',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pw));
            // xhr.setRequestHeader("Content-Type5", "application/json");
        },
        contentType: "application/json; charset=UTF-8",
        dataType: "json",
        data: JSON.stringify({
            username: user,
            password: pw,
            firstName: firstName,
            lastName: lastName
        }, false),
        success: function() {
            console.log("SUCESS!!");
        },
        error: function() {
            console.log("THERE WAS AN ERROR!");
        },
        // "content-type": "application/json"
    });

    console.log("New User has been registered POST REQUEST");

})

var id = [];

/////////////////////////////////
////Show Resource Input Form/////
/////////////////////////////////

function showResourceInput() {
    $(".formsection").removeClass("hidden");
    $(".login").addClass("hidden");
}

////////////////////////////
////Data Rendering//////////
////////////////////////////

function loadData() {
    $.get( 'api', function( data ) {
        $("#grid").removeClass("hidden");
        // console.log(data.posts[0].id);
        for (var i = 0; i < data.posts.length; i++) {
            $("#grid").append(`
            <section class="resource" id="${data.posts[i].id}">
                <span><h1>${data.posts[i].title}</h1></span> 
                <span>${data.posts[i].content}</span>
                <section class="clickableitems">
                <span class="link"><a href='${data.posts[i].url}' target="_blank"><button>Click Here</button></a></span>
                <section class="delete-request" onclick="deleteResource();"><button>Delete</button></section>
                <section class="edit-request" onclick="editResource();"><button>Edit</button></section>
                </section class="clickableitems
            </section>
            `);
            id[i] = `${data.posts[i].id}`;
            // console.log(id[i]);
        };
    });
}

/////////////////////////////
////Delete Resource//////////
/////////////////////////////

function deleteResource() {
    console.log(id);
    $.ajax({
        url: 'api/' + id[0],
        type: 'DELETE',
        success: loadData()
    });
    $(".resource").click(function(e) {
        e.preventDefault();
        console.log("Deleting...");
    });
}

/////////////////////////////
////Edit Resource///////////

function editResource() {
    console.log("Attempting to Edit a resource");

}

/////////////////////////////
////Submit Resource//////////
/////////////////////////////

$(".resoure-submit").on("submit", function(e) {
    e.preventDefault();
    var title = $(".title").val();
    var description = $(".description").val();
    var link = $(".link").val();
    var category = $(".category").val();
    var dataInput = {
        name: title,
        description: description,
        link: link,
        category: category
    };
    $("#grid").append(`
    <section class="resource">
        <span><h1>${title}</h1></span> 
        <span>${description}</span>
        <section class="clickableitems">
        <span class="link"><a href='${link}' target="_blank"><button>Click Here</button></a></span>
        <section class="delete-request" onclick="deleteResource();"><button>Delete</button></section>
        <section class="edit-request" onclick="editResource();"><button>Edit</button></section>
        </section class="clickableitems>
    </section>
    `);
    $.post('api', {
        title: $(".title").val(),
        content: $(".description").val(),
        url: $(".link").val()
    })
});
