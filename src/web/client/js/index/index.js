$(function() {
  function setState(element, enabled) {
    if ( enabled ) {
      $(element).removeAttr('disabled');
    } else {
      $(element).attr('disabled', 'disabled');
    }
  }
  function getUsername() {
    return $("#login-username").val();
  }
  function getPassword() {
    return $("#login-password").val();
  }
  
  $("input").keyup(function() {
    var username = getUsername();
    var password = getPassword();
    console.log(username, password);
    
    setState($("#login"), username && password);
  });
  $("#login").click(function(e) {
    e.preventDefault();
    
    var username = getUsername();
    var password = getPassword();
    
    if ( username && password ) {
      $.post('/validate_login', { username: username, password: password }, function(data) {
        
        console.log(data);
        if ( data ) {
          if ( data.statusCode === 200 ) {
            location.href = "/app";
          } else {
            console.log(data.message);
          }
        }
        
      });
    }
    
    return false;
  });
});
